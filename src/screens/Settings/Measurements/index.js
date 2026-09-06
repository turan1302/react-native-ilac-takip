import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useProfile } from '../../../common/ProfileContext';
import { useTheme } from '../../../common/ThemeContext';
import {
  MEASUREMENT_TYPES,
  addMeasurement,
  getMeasurements,
  removeMeasurement,
} from '../../../common/MeasurementStorage';
import { shareDiaryDoctorReport } from '../../../common/ReportService';
import AnimatedReveal from '../../../components/shared/AnimatedReveal';
import styles, { COLORS as BASE } from '../SymptomDiary/styles';

const Measurements = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { activeProfileId } = useProfile();
  const { colors, isDark } = useTheme();
  const [entries, setEntries] = useState([]);
  const [type, setType] = useState(route.params?.type || 'bp');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const prefillPill = route.params?.pill || null;

  const load = useCallback(async () => {
    const all = await getMeasurements();
    setEntries(
      all.filter(item => !item.profileId || item.profileId === activeProfileId),
    );
  }, [activeProfileId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const selectedType = useMemo(
    () => MEASUREMENT_TYPES.find(item => item.id === type) || MEASUREMENT_TYPES[0],
    [type],
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      await addMeasurement({
        type,
        value,
        note,
        pillId: prefillPill?.id || '',
        pillName: prefillPill?.name || '',
        profileId: activeProfileId,
      });
      setValue('');
      setNote('');
      await load();
    } catch (error) {
      Alert.alert('Kayıt eklenemedi', error.message || 'Ölçüm değeri girin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AnimatedReveal index={0} distance={12}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Ölçüm günlüğü
            </Text>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={async () => {
                try {
                  await shareDiaryDoctorReport();
                } catch (error) {
                  Alert.alert('Paylaşılamadı', error?.message || '');
                }
              }}
            >
              <Feather name="share-2" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </AnimatedReveal>

        <AnimatedReveal index={1}>
          <Text style={[styles.intro, { color: colors.textSecondary }]}>
            Tansiyon, şeker veya kilo kaydı bırakın. Doktor raporuna otomatik
            eklenir
            {prefillPill ? ` (${prefillPill.name} ile bağlantılı)` : ''}
          </Text>
        </AnimatedReveal>

        <AnimatedReveal index={2}>
          <View
            style={[
              styles.composer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Tür
            </Text>
            <View style={styles.chipRow}>
              {MEASUREMENT_TYPES.map(item => {
                const active = type === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.chip,
                      { borderColor: colors.border, backgroundColor: colors.background },
                      active && styles.chipActive,
                    ]}
                    onPress={() => setType(item.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: colors.textSecondary },
                        active && styles.chipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={`${selectedType.placeholder} ${selectedType.unit}`}
              placeholderTextColor={colors.textMuted}
              value={value}
              onChangeText={setValue}
              keyboardType={type === 'bp' ? 'default' : 'decimal-pad'}
            />
            <TextInput
              style={[styles.input, { color: colors.text, minHeight: 48 }]}
              placeholder="Not (opsiyonel)"
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
            />
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedReveal>

        {entries.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            Henüz ölçüm yok
          </Text>
        ) : (
          entries.map(entry => (
            <View
              key={entry.id}
              style={[
                styles.entry,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.entryHeader}>
                <Text style={[styles.entryTime, { color: colors.textMuted }]}>
                  {new Date(entry.createdAt).toLocaleString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert('Sil', 'Bu ölçümü silmek istiyor musunuz?', [
                      { text: 'Vazgeç', style: 'cancel' },
                      {
                        text: 'Sil',
                        style: 'destructive',
                        onPress: async () => {
                          await removeMeasurement(entry.id);
                          await load();
                        },
                      },
                    ])
                  }
                >
                  <Feather name="trash-2" size={16} color={colors.danger || BASE.primary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.entryPill, { color: colors.primary }]}>
                {entry.typeLabel}: {entry.value} {entry.unit}
              </Text>
              {entry.pillName ? (
                <Text style={[styles.entryTags, { color: colors.warning }]}>
                  İlaç: {entry.pillName}
                </Text>
              ) : null}
              {entry.note ? (
                <Text style={[styles.entryNote, { color: colors.text }]}>
                  {entry.note}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Measurements;
