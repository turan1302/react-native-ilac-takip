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

export const shareDiaryForDoctor = async () => {
  const { shareDiaryDoctorReport } = require('./ReportService');
  return shareDiaryDoctorReport();
};
