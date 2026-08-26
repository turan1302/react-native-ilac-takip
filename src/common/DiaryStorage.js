import { Share, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayDateKey } from './IntakeStorage';
import { SYMPTOM_DIARY_KEY } from './storage/keys';

export { SYMPTOM_DIARY_KEY };

export const SYMPTOM_TAGS = [
  { id: 'headache', label: 'Baş ağrısı' },
  { id: 'stomach', label: 'Mide' },
  { id: 'sleep', label: 'Uyku' },
  { id: 'dizzy', label: 'Baş dönmesi' },
  { id: 'itch', label: 'Kaşıntı' },
  { id: 'fatigue', label: 'Yorgunluk' },
  { id: 'nausea', label: 'Bulantı' },
];

export const getDiaryEntries = async () => {
  const data = await AsyncStorage.getItem(SYMPTOM_DIARY_KEY);
  const entries = data ? JSON.parse(data) : [];
  return Array.isArray(entries)
    ? entries.sort((left, right) =>
        String(right.createdAt || '').localeCompare(String(left.createdAt || '')),
      )
    : [];
};

export const addDiaryEntry = async ({
  pillId = '',
  pillName = '',
  note = '',
  tags = [],
} = {}) => {
  const trimmedNote = String(note || '').trim();
  const cleanTags = (tags || []).filter(Boolean);

  if (!trimmedNote && !cleanTags.length) {
    throw new Error('Kısa bir not veya belirti seçin');
  }

  const entries = await getDiaryEntries();
  const entry = {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    date: getTodayDateKey(),
    pillId: pillId ? String(pillId) : '',
    pillName: pillName || '',
    note: trimmedNote,
    tags: cleanTags,
  };

  await AsyncStorage.setItem(
    SYMPTOM_DIARY_KEY,
    JSON.stringify([entry, ...entries]),
  );

  return entry;
};

export const removeDiaryEntry = async entryId => {
  const entries = await getDiaryEntries();
  await AsyncStorage.setItem(
    SYMPTOM_DIARY_KEY,
    JSON.stringify(entries.filter(entry => entry.id !== entryId)),
  );
};

const formatEntryLine = entry => {
  const time = entry.createdAt
    ? new Date(entry.createdAt).toLocaleString('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : entry.date;
  const tags = (entry.tags || []).join(', ');
  const pill = entry.pillName ? ` • ${entry.pillName}` : '';
  const note = entry.note ? `\n  ${entry.note}` : '';
  const tagPart = tags ? `\n  Belirtiler: ${tags}` : '';

  return `• ${time}${pill}${tagPart}${note}`;
};

export const shareDiaryForDoctor = async () => {
  const entries = await getDiaryEntries();

  const message = [
    'İlaç Takibi — yan etki / not günlüğü',
    `Tarih: ${new Date().toLocaleString('tr-TR')}`,
    '',
    entries.length
      ? entries.map(formatEntryLine).join('\n\n')
      : 'Kayıt yok.',
  ].join('\n');

  return Share.share(
    Platform.OS === 'ios'
      ? { title: 'Doktor notları', message }
      : { title: 'Doktor notları', message, subject: 'İlaç Takibi notları' },
  );
};
