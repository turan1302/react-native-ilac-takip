import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { addPill } from '../../../common/PillStorage';
import { parseTime } from '../../../common/pillFormConstants';
import {
  ensureNotificationPermissions,
  schedulePillReminder,
} from '../../../common/NotificationService';
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
import styles, { COLORS } from './styles';

const AddPill = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [type, setType] = useState('Tablet');
  const [frequency, setFrequency] = useState('Her Gün');
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [tempHour, setTempHour] = useState('09');
  const [tempMinute, setTempMinute] = useState('00');
  const [saving, setSaving] = useState(false);

  const isAsNeeded = frequency === 'İhtiyaç Halinde';

  const openTimeModal = () => {
    const { hour, minute } = parseTime(time);
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

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Uyarı',
        textBody: 'Lütfen ilaç adını girin.',
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

  const handleCancel = () => {
    navigation.goBack();
  };

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
          <Header onCancel={handleCancel} />

          <Banner />

          <PillNameField value={name} onChangeText={setName} />

          <DosageTypeRow
            dosage={dosage}
            type={type}
            onDosageChange={setDosage}
            onOpenTypePicker={() => setTypeModalVisible(true)}
          />

          <FrequencyChips value={frequency} onChange={setFrequency} />

          {!isAsNeeded && (
            <TimePickerField time={time} onPress={openTimeModal} />
          )}

          <NotesField
            value={notes}
            onChangeText={setNotes}
            onFocus={handleNotesFocus}
          />

          <FormActions
            saving={saving}
            onSave={handleSave}
            onCancel={handleCancel}
          />
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
    </SafeAreaView>
  );
};

export default AddPill;
