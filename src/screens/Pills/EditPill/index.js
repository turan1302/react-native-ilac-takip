import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { getPillById, updatePill, deletePill } from '../../../common/PillStorage';
import {
  getTodayDateKey,
  removeIntakeReportsForPill,
} from '../../../common/IntakeStorage';
import { removeDismissalsForPill } from '../../../common/InAppNotificationStorage';
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
import {
  buildDateKey,
  getDaysInMonth,
  getYearOptions,
  parseDateKeyParts,
} from '../../../common/pillHelpers';
import {
  cancelPillReminder,
  schedulePillReminder,
} from '../../../common/NotificationService';
import DatePickerModal from '../../../components/Program/DatePickerModal';
import ScheduleExtras, {
  ProspectusField,
  StockFields,
} from '../../../components/Pills/AddPill/ScheduleExtras';
import DosageTypeRow from '../../../components/Pills/AddPill/DosageTypeRow';
import FormActions from '../../../components/Pills/AddPill/FormActions';
import FrequencyChips from '../../../components/Pills/AddPill/FrequencyChips';
import NotesField from '../../../components/Pills/AddPill/NotesField';
import PillNameField from '../../../components/Pills/AddPill/PillNameField';
import TimePickerField from '../../../components/Pills/AddPill/TimePickerField';
import TimePickerModal from '../../../components/Pills/AddPill/TimePickerModal';
import TypePickerModal from '../../../components/Pills/AddPill/TypePickerModal';
import AnimatedReveal from '../../../components/shared/AnimatedReveal';
import Banner from '../../../components/Pills/AddPill/Banner';
import Header from '../../../components/Pills/EditPill/Header';
import LoadingState from '../../../components/Pills/EditPill/LoadingState';
import styles, { COLORS } from './styles';

const EditPill = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const scrollViewRef = useRef(null);
  const pillId = route.params?.pillId;

  const [loading, setLoading] = useState(true);
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
  const [deleting, setDeleting] = useState(false);

  const isAsNeeded = isAsNeededFrequency(frequency);
  const intervalHours = INTERVAL_HOURS[frequency];
  const isBusy = saving || deleting;

  useEffect(() => {
    const loadPill = async () => {
      if (!pillId) {
        navigation.goBack();
        return;
      }

      const pill = await getPillById(pillId);

      if (!pill) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Hata',
          textBody: 'İlaç bulunamadı.',
        });
        navigation.goBack();
        return;
      }

      setName(pill.name || '');
      setDosage(pill.dosage || '');
      setType(pill.type || 'Tablet');
      setFrequency(pill.frequency || 'Her Gün');
      setTime(pill.time || '09:00');
      setNotes(pill.notes || '');
      setProspectus(pill.prospectus || '');
      setStockQuantity(
        pill.stockQuantity == null ? '' : String(pill.stockQuantity),
      );
      setStockThreshold(String(pill.stockThreshold ?? 5));
      setDaysOfWeek(pill.daysOfWeek || []);
      setDaysOfMonth(pill.daysOfMonth || []);
      setStartDate(pill.startDate || getTodayDateKey());
      setEndDate(pill.endDate || '');
      setLoading(false);
    };

    loadPill();
  }, [pillId, navigation]);

  const openTimeModal = () => {
    const { hour, minute } = snapTimeParts(parseTime(time));
    setTempHour(hour);
    setTempMinute(minute);
    setTimeModalVisible(true);
  };

  const confirmTime = () => {
    setTime(`${tempHour}:${tempMinute}`);
    setTimeModalVisible(false);
  };

  const handleTypeSelect = selectedType => {
    setType(selectedType);
    setTypeModalVisible(false);
  };

  const handleNotesFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
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

  const confirmFormDate = () => {
    const next = buildDateKey({ year: tempYear, month: tempMonth, day: tempDay });
    if (dateTarget === 'end') {
      setEndDate(next);
    } else {
      setStartDate(next);
    }
    setDateModalVisible(false);
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

      const updatedPill = await updatePill(pillId, {
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
      });

      await schedulePillReminder(updatedPill);

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Başarılı',
        textBody: 'İlaç güncellendi.',
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Hata',
        textBody: 'İlaç güncellenemedi.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'İlacı Sil',
      'Bu ilaç kalıcı olarak silinecek. Tüm kullanım kayıtları da kaldırılacak. Emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deletePill(pillId);
              await removeIntakeReportsForPill(pillId);
              await removeDismissalsForPill(pillId);
              await cancelPillReminder(pillId);

              Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Başarılı',
                textBody: 'İlaç silindi.',
              });

              navigation.goBack();
            } catch (error) {
              Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Hata',
                textBody: 'İlaç silinemedi.',
              });
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return <LoadingState />;
  }

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
            <Header
              onCancel={handleCancel}
              onDelete={handleDelete}
              disabled={isBusy}
            />
          </AnimatedReveal>

          <AnimatedReveal index={1}>
            <Banner text="İlaç bilgilerinizi güncelleyin." />
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
              onToggleWeekday={day =>
                setDaysOfWeek(prev =>
                  prev.includes(day) ? prev.filter(item => item !== day) : [...prev, day],
                )
              }
              onToggleMonthDay={day =>
                setDaysOfMonth(prev =>
                  prev.includes(day) ? prev.filter(item => item !== day) : [...prev, day],
                )
              }
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
                Gün içi saatler: {getIntervalTimes(time, intervalHours).join(', ')}
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
              disabled={deleting}
              saveLabel="Güncelle"
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </AnimatedReveal>
        </ScrollView>
      </KeyboardAvoidingView>

      <TypePickerModal
        visible={typeModalVisible}
        selectedType={type}
        onClose={() => setTypeModalVisible(false)}
        onSelect={handleTypeSelect}
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
        dayOptions={Array.from(
          { length: getDaysInMonth(tempYear, tempMonth) },
          (_, index) => index + 1,
        )}
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
        onConfirm={confirmFormDate}
      />
    </SafeAreaView>
  );
};

export default EditPill;
