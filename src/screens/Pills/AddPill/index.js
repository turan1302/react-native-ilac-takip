import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { addPill } from '../../../common/PillStorage';
import styles, { COLORS } from './styles';

const PILL_TYPES = [
  'Tablet',
  'Kapsül',
  'Şurup',
  'Enjeksiyon',
  'Aerosol',
  'Sprey',
  'Krem',
  'Gargara',
];
const FREQUENCIES = ['Her Gün', 'Haftalık', 'İhtiyaç Halinde'];
const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0'),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, '0'),
);

const parseTime = value => {
  const [hour = '09', minute = '00'] = value.split(':');
  return {
    hour: hour.padStart(2, '0'),
    minute: minute.padStart(2, '0'),
  };
};

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

      await addPill({
        name: name.trim(),
        dosage: dosage.trim(),
        type,
        frequency,
        time: isAsNeeded ? '' : time,
        notes: notes.trim(),
      });

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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>İlaç Ekle</Text>
            <View style={styles.headerButton}>
              <MaterialCommunityIcons
                name="pill"
                size={22}
                color={COLORS.primary}
              />
            </View>
          </View>

          <View style={styles.banner}>
            <View style={styles.bannerImage} />
            <View style={styles.bannerDecor} />
            <View style={styles.bannerDecorSmall} />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerText}>
                Yeni bir tedavi planı oluşturun.
              </Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>İlaç Adı</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.inputInner}
                placeholder="Örn: Parol"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />
              <MaterialCommunityIcons
                name="pill"
                size={20}
                color={COLORS.textMuted}
              />
            </View>
          </View>

          <View style={[styles.row, styles.fieldGroup]}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Dozaj</Text>
              <TextInput
                style={styles.input}
                placeholder="500 mg"
                placeholderTextColor={COLORS.textMuted}
                value={dosage}
                onChangeText={setDosage}
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Tür</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setTypeModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.selectText}>{type}</Text>
                <Feather
                  name="chevron-down"
                  size={18}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Sıklık</Text>
            <View style={styles.chipsWrap}>
              {FREQUENCIES.map(item => {
                const isActive = frequency === item;

                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setFrequency(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive && styles.chipTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {!isAsNeeded && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Saat Belirle</Text>
              <TouchableOpacity
                style={styles.timeBox}
                onPress={openTimeModal}
                activeOpacity={0.7}
              >
                <View style={styles.timeIconBox}>
                  <Feather name="clock" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.timeText}>{time}</Text>
                <Feather name="clock" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Notlar (Opsiyonel)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Aç karnına içilmelidir..."
              placeholderTextColor={COLORS.textMuted}
              value={notes}
              onChangeText={setNotes}
              onFocus={handleNotesFocus}
              multiline
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Feather name="check-circle" size={20} color={COLORS.white} />
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelButtonText}>Vazgeç</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={typeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTypeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTypeModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Tür Seçin</Text>
              {PILL_TYPES.map(item => (
                <TouchableOpacity
                  key={item}
                  style={styles.modalOption}
                  onPress={() => {
                    setType(item);
                    setTypeModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      type === item && styles.modalOptionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={timeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTimeModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Saat Seçin</Text>

              <View style={styles.timePickerRow}>
                <ScrollView
                  style={styles.timePickerColumn}
                  showsVerticalScrollIndicator={false}
                >
                  {HOURS.map(hour => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.timePickerItem,
                        tempHour === hour && styles.timePickerItemActive,
                      ]}
                      onPress={() => setTempHour(hour)}
                    >
                      <Text
                        style={[
                          styles.timePickerItemText,
                          tempHour === hour && styles.timePickerItemTextActive,
                        ]}
                      >
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.timePickerSeparator}>:</Text>

                <ScrollView
                  style={styles.timePickerColumn}
                  showsVerticalScrollIndicator={false}
                >
                  {MINUTES.map(minute => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.timePickerItem,
                        tempMinute === minute && styles.timePickerItemActive,
                      ]}
                      onPress={() => setTempMinute(minute)}
                    >
                      <Text
                        style={[
                          styles.timePickerItemText,
                          tempMinute === minute &&
                            styles.timePickerItemTextActive,
                        ]}
                      >
                        {minute}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmTime}
                activeOpacity={0.85}
              >
                <Text style={styles.modalConfirmButtonText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default AddPill;
