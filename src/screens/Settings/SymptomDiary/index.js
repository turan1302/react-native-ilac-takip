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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { getPillsForProfile } from '../../../common/PillStorage';
import { useProfile } from '../../../common/ProfileContext';
import {
  SYMPTOM_TAGS,
  addDiaryEntry,
  getDiaryEntries,
  removeDiaryEntry,
} from '../../../common/DiaryStorage';
import { shareDiaryDoctorReport } from '../../../common/ReportService';
import AnimatedReveal from '../../../components/shared/AnimatedReveal';
import styles, { COLORS } from './styles';

const formatEntryTime = createdAt => {
  if (!createdAt) {
    return '';
  }

  return new Date(createdAt).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SymptomDiary = () => {
  const navigation = useNavigation();
  const { activeProfileId } = useProfile();
  const [entries, setEntries] = useState([]);
  const [pills, setPills] = useState([]);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedPillId, setSelectedPillId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [nextEntries, nextPills] = await Promise.all([
      getDiaryEntries(),
      getPillsForProfile(activeProfileId),
    ]);
    setEntries(nextEntries);
    setPills(nextPills);
  }, [activeProfileId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const selectedPill = useMemo(
    () => pills.find(pill => pill.id === selectedPillId) || null,
    [pills, selectedPillId],
  );

  const toggleTag = tag => {
    setSelectedTags(current =>
      current.includes(tag) ? current.filter(item => item !== tag) : [...current, tag],
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await addDiaryEntry({
        pillId: selectedPill?.id || '',
        pillName: selectedPill?.name || '',
        note,
        tags: selectedTags,
      });
      setNote('');
      setSelectedTags([]);
      await load();
    } catch (error) {
      Alert.alert('Kayıt eklenemedi', error.message || 'Kısa bir not veya belirti seçin.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = entry => {
    Alert.alert('Kaydı sil', 'Bu notu silmek istiyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await removeDiaryEntry(entry.id);
          await load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

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
              <Feather name="arrow-left" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Yan etki / not günlüğü</Text>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={async () => {
                try {
                  await shareDiaryDoctorReport();
                } catch (error) {
                  Alert.alert(
                    'Paylaşılamadı',
                    error?.message || 'Doktor günlüğü oluşturulamadı.',
                  );
                }
              }}
              activeOpacity={0.7}
            >
              <Feather name="share-2" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </AnimatedReveal>

        <AnimatedReveal index={1}>
          <Text style={styles.intro}>
            Kısa kayıt bırakın: “Başım ağrıdı, ilacı aldım”. Sağ üstten not ve yan etkileri tek dosyada doktora gönderin.
          </Text>
        </AnimatedReveal>

        <AnimatedReveal index={2}>
          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              placeholder="Başım ağrıdı, ilacı aldım"
              placeholderTextColor={COLORS.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
            />

            <Text style={styles.label}>Belirti</Text>
            <View style={styles.chipRow}>
              {SYMPTOM_TAGS.map(tag => {
                const active = selectedTags.includes(tag.label);
                return (
                  <TouchableOpacity
                    key={tag.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleTag(tag.label)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {tag.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {pills.length ? (
              <>
                <Text style={styles.label}>İlaç (opsiyonel)</Text>
                <View style={styles.chipRow}>
                  {pills.map(pill => {
                    const active = selectedPillId === pill.id;
                    return (
                      <TouchableOpacity
                        key={pill.id}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() =>
                          setSelectedPillId(current => (current === pill.id ? '' : pill.id))
                        }
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {pill.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : null}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</Text>
            </TouchableOpacity>
          </View>
        </AnimatedReveal>

        {!entries.length ? (
          <Text style={styles.empty}>Henüz not yok. İlk kaydı yukarıdan ekleyin.</Text>
        ) : (
          entries.map((entry, index) => (
            <AnimatedReveal key={entry.id} index={index + 3}>
              <View style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTime}>{formatEntryTime(entry.createdAt)}</Text>
                  <TouchableOpacity onPress={() => handleDelete(entry)} hitSlop={8}>
                    <Feather name="trash-2" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                {entry.pillName ? (
                  <Text style={styles.entryPill}>{entry.pillName}</Text>
                ) : null}
                {entry.tags?.length ? (
                  <Text style={styles.entryTags}>{entry.tags.join(' • ')}</Text>
                ) : null}
                {entry.note ? <Text style={styles.entryNote}>{entry.note}</Text> : null}
              </View>
            </AnimatedReveal>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SymptomDiary;
