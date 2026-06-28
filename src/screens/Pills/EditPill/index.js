import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { getPillById, updatePill, deletePill } from '../../../common/PillStorage';
import { removeIntakeReportsForPill } from '../../../common/IntakeStorage';
import { removeDismissalsForPill } from '../../../common/InAppNotificationStorage';
import { parseTime } from '../../../common/pillFormConstants';
import {
  cancelPillReminder,
  schedulePillReminder,
} from '../../../common/NotificationService';
import DosageTypeRow from '../../../components/Pills/AddPill/DosageTypeRow';
import FormActions from '../../../components/Pills/AddPill/FormActions';
import FrequencyChips from '../../../components/Pills/AddPill/FrequencyChips';
import NotesField from '../../../components/Pills/AddPill/NotesField';
import PillNameField from '../../../components/Pills/AddPill/PillNameField';
import TimePickerField from '../../../components/Pills/AddPill/TimePickerField';
import TimePickerModal from '../../../components/Pills/AddPill/TimePickerModal';
import TypePickerModal from '../../../components/Pills/AddPill/TypePickerModal';
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
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [tempHour, setTempHour] = useState('09');
  const [tempMinute, setTempMinute] = useState('00');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAsNeeded = frequency === 'İhtiyaç Halinde';
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
      setLoading(false);
    };

    loadPill();
  }, [pillId, navigation]);

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

      const updatedPill = await updatePill(pillId, {
        name: name.trim(),
        dosage: dosage.trim(),
        type,
        frequency,
        time: isAsNeeded ? '' : time,
        notes: notes.trim(),
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -20}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          <Header
            onCancel={handleCancel}
            onDelete={handleDelete}
            disabled={isBusy}
          />

          <Banner text="İlaç bilgilerinizi güncelleyin." />

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
            disabled={deleting}
            saveLabel="Güncelle"
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

export default EditPill;
