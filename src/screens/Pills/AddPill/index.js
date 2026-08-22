import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { addPill } from '../../../common/PillStorage';
import { useProfile } from '../../../common/ProfileContext';
import {
  getIntervalTimes,
  INTERVAL_HOURS,
  isAsNeededFrequency,
  isIntervalFrequency,
  needsDateRange,
  needsMonthDayPicker,
  needsWeekdayPicker,
  parseTime,
  snapTimeParts,
} from '../../../common/pillFormConstants';
import { getTodayDateKey } from '../../../common/IntakeStorage';
import {
  buildDateKey,
  getDaysInMonth,
  getYearOptions,
  parseDateKeyParts,
} from '../../../common/pillHelpers';
import {
  ensureNotificationPermissions,
  schedulePillReminder,
} from '../../../common/NotificationService';
import AnimatedReveal from '../../../components/shared/AnimatedReveal';
import Banner from '../../../components/Pills/AddPill/Banner';
import DosageTypeRow from '../../../components/Pills/AddPill/DosageTypeRow';
import FormActions from '../../../components/Pills/AddPill/FormActions';
import FrequencyChips from '../../../components/Pills/AddPill/FrequencyChips';
import Header from '../../../components/Pills/AddPill/Header';
import NotesField from '../../../components/Pills/AddPill/NotesField';
import PillNameField from '../../../components/Pills/AddPill/PillNameField';
import TimePickerField from '../../../components/Pills/AddPill/TimePickerField';
import TimePickerModal from '../../../components/Pills/AddPill/TimePickerModal';
import TypePickerModal from '../../../components/Pills/AddPill/TypePickerModal';
import DatePickerModal from '../../../components/Program/DatePickerModal';
import ScheduleExtras, {
  ProspectusField,
  StockFields,
} from '../../../components/Pills/AddPill/ScheduleExtras';
import styles, { COLORS } from './styles';

const AddPill = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const { activeProfileId } = useProfile();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [type, setType] = useState('Tablet');
  const [frequency, setFrequency] = useState('Her Gün');
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [prospectus, setProspectus] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockThreshold, setStockThreshold] = useState('5');
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [daysOfMonth, setDaysOfMonth] = useState([]);
  const [startDate, setStartDate] = useState(getTodayDateKey());
  const [endDate, setEndDate] = useState('');
  const [dateTarget, setDateTarget] = useState('start');
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [tempDay, setTempDay] = useState(1);
  const [tempMonth, setTempMonth] = useState(1);
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [tempHour, setTempHour] = useState('09');
  const [tempMinute, setTempMinute] = useState('00');
  const [saving, setSaving] = useState(false);

  const isAsNeeded = isAsNeededFrequency(frequency);
  const intervalHours = INTERVAL_HOURS[frequency];

  const openTimeModal = () => {
    const snapped = snapTimeParts(parseTime(time));
    setTempHour(snapped.hour);
    setTempMinute(snapped.minute);
    setTimeModalVisible(true);
  };

  const confirmTime = () => {
    setTime(`${tempHour}:${tempMinute}`);
    setTimeModalVisible(false);
  };

  const openDateModal = target => {
    const current = target === 'end' ? endDate || startDate : startDate;
    const { year, month, day } = parseDateKeyParts(current || getTodayDateKey());
    setDateTarget(target);
    setTempYear(year);
    setTempMonth(month);
    setTempDay(day);
    setDateModalVisible(true);
  };

  const confirmDate = () => {
    const next = buildDateKey({ year: tempYear, month: tempMonth, day: tempDay });
    if (dateTarget === 'end') {
      setEndDate(next);
    } else {
      setStartDate(next);
    }
    setDateModalVisible(false);
  };

  const toggleWeekday = day => {
    setDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(item => item !== day) : [...prev, day],
    );
  };

  const toggleMonthDay = day => {
    setDaysOfMonth(prev =>
      prev.includes(day) ? prev.filter(item => item !== day) : [...prev, day],
    );
  };

  const handleNotesFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Uyarı',
        textBody: 'Lütfen ilaç adını girin.',
      });
      return;
    }

    if (needsWeekdayPicker(frequency) && daysOfWeek.length < 1) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Uyarı',
        textBody: 'Haftanın en az bir gününü seçin.',
      });
      return;
    }

    if (needsMonthDayPicker(frequency) && daysOfMonth.length < 1) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Uyarı',
        textBody: 'Ayın en az bir gününü seçin.',
      });
      return;
    }

    if (needsDateRange(frequency) && (!startDate || !endDate)) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Uyarı',
        textBody: 'Başlangıç ve bitiş tarihlerini seçin.',
      });
      return;
    }

    try {
      setSaving(true);

      const newPill = await addPill({
        name: name.trim(),
        dosage: dosage.trim(),
        type,
        frequency,
        time: isAsNeeded ? '' : time,
        notes: notes.trim(),
        prospectus: prospectus.trim(),
        stockQuantity: stockQuantity === '' ? null : Number(stockQuantity),
        stockThreshold: stockThreshold === '' ? 5 : Number(stockThreshold),
        daysOfWeek,
        daysOfMonth,
        startDate,
        endDate: needsDateRange(frequency) ? endDate : endDate || '',
        profileId: activeProfileId,
      });

      const permissionResult = await ensureNotificationPermissions();
      const reminderScheduled = await schedulePillReminder(newPill);

      if (!isAsNeeded && !permissionResult.notificationsGranted) {
        Alert.alert(
          'Bildirim İzni Kapalı',
          'İlaç kaydedildi ancak hatırlatıcı için bildirim izni gerekli.',
        );
      } else if (!isAsNeeded && !reminderScheduled) {
        Alert.alert(
          'Hatırlatıcı Planlanamadı',
          'İlaç kaydedildi ancak hatırlatıcı oluşturulamadı. Program sekmesinden hatırlatıcıları kontrol edin.',
        );
      }

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Başarılı',
        textBody: 'İlaç kaydedildi.',
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Hata',
        textBody: 'İlaç kaydedilemedi.',
      });
    } finally {
      setSaving(false);
    }
  };

  const daysInMonth = getDaysInMonth(tempYear, tempMonth);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={false}
        >
          <AnimatedReveal index={0} distance={12}>
            <Header onCancel={() => navigation.goBack()} />
          </AnimatedReveal>

          <AnimatedReveal index={1}>
            <Banner />
          </AnimatedReveal>

          <AnimatedReveal index={2}>
            <PillNameField value={name} onChangeText={setName} />
          </AnimatedReveal>

          <AnimatedReveal index={3}>
            <DosageTypeRow
              dosage={dosage}
              type={type}
              onDosageChange={setDosage}
              onOpenTypePicker={() => setTypeModalVisible(true)}
            />
          </AnimatedReveal>

          <AnimatedReveal index={4}>
            <FrequencyChips value={frequency} onChange={setFrequency} />
          </AnimatedReveal>

          <AnimatedReveal index={5}>
            <ScheduleExtras
              frequency={frequency}
              daysOfWeek={daysOfWeek}
              daysOfMonth={daysOfMonth}
              startDate={startDate}
              endDate={endDate}
              onToggleWeekday={toggleWeekday}
              onToggleMonthDay={toggleMonthDay}
              onOpenStartDate={() => openDateModal('start')}
              onOpenEndDate={() => openDateModal('end')}
            />
          </AnimatedReveal>

          {!isAsNeeded && (
            <AnimatedReveal index={6}>
              <TimePickerField
                time={time}
                onPress={openTimeModal}
                label={isIntervalFrequency(frequency) ? 'İlk saat' : 'Saat Belirle'}
              />
            </AnimatedReveal>
          )}

          {intervalHours ? (
            <AnimatedReveal index={7}>
              <Text style={{ marginTop: -8, marginBottom: 16, color: '#6B7280' }}>
                Gün içi saatler:{' '}
                {getIntervalTimes(time, intervalHours).join(', ')}
              </Text>
            </AnimatedReveal>
          ) : null}

          <AnimatedReveal index={8}>
            <StockFields
              stockQuantity={stockQuantity}
              stockThreshold={stockThreshold}
              onChangeStock={setStockQuantity}
              onChangeThreshold={setStockThreshold}
            />
          </AnimatedReveal>

          <AnimatedReveal index={9}>
            <ProspectusField
              value={prospectus}
              onChangeText={setProspectus}
              onFocus={handleNotesFocus}
            />
          </AnimatedReveal>

          <AnimatedReveal index={10}>
            <NotesField
              value={notes}
              onChangeText={setNotes}
              onFocus={handleNotesFocus}
            />
          </AnimatedReveal>

          <AnimatedReveal index={11}>
            <FormActions
              saving={saving}
              onSave={handleSave}
              onCancel={() => navigation.goBack()}
            />
          </AnimatedReveal>
        </ScrollView>
      </KeyboardAvoidingView>

      <TypePickerModal
        visible={typeModalVisible}
        selectedType={type}
        onClose={() => setTypeModalVisible(false)}
        onSelect={selectedType => {
          setType(selectedType);
          setTypeModalVisible(false);
        }}
      />

      <TimePickerModal
        visible={timeModalVisible}
        tempHour={tempHour}
        tempMinute={tempMinute}
        onClose={() => setTimeModalVisible(false)}
        onSelectHour={setTempHour}
        onSelectMinute={setTempMinute}
        onConfirm={confirmTime}
      />

      <DatePickerModal
        visible={dateModalVisible}
        dayOptions={Array.from({ length: daysInMonth }, (_, index) => index + 1)}
        yearOptions={getYearOptions(tempYear)}
        tempDay={tempDay}
        tempMonth={tempMonth}
        tempYear={tempYear}
        onClose={() => setDateModalVisible(false)}
        onSelectDay={setTempDay}
        onSelectMonth={setTempMonth}
        onSelectYear={setTempYear}
        onGoToToday={() => {
          setStartDate(getTodayDateKey());
          setDateModalVisible(false);
        }}
        onConfirm={confirmDate}
      />
    </SafeAreaView>
  );
};

export default AddPill;
