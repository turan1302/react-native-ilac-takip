import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayDateKey } from './IntakeStorage';
import { MEASUREMENTS_KEY } from './storage/keys';

export { MEASUREMENTS_KEY };

export const MEASUREMENT_TYPES = [
  { id: 'bp', label: 'Tansiyon', unit: 'mmHg', placeholder: '120/80' },
  { id: 'sugar', label: 'Şeker', unit: 'mg/dL', placeholder: '110' },
  { id: 'weight', label: 'Kilo', unit: 'kg', placeholder: '72.5' },
];

export const getMeasurementType = id =>
  MEASUREMENT_TYPES.find(item => item.id === id) || MEASUREMENT_TYPES[0];

export const getMeasurements = async () => {
  const data = await AsyncStorage.getItem(MEASUREMENTS_KEY);
  const entries = data ? JSON.parse(data) : [];
  return Array.isArray(entries)
    ? entries.sort((left, right) =>
        String(right.createdAt || '').localeCompare(String(left.createdAt || '')),
      )
    : [];
};

export const addMeasurement = async ({
  type = 'bp',
  value = '',
  note = '',
  pillId = '',
  pillName = '',
  profileId = '',
} = {}) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    throw new Error('Ölçüm değeri girin');
  }

  const entries = await getMeasurements();
  const meta = getMeasurementType(type);
  const entry = {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    date: getTodayDateKey(),
    type: meta.id,
    typeLabel: meta.label,
    unit: meta.unit,
    value: trimmed,
    note: String(note || '').trim(),
    pillId: pillId ? String(pillId) : '',
    pillName: pillName || '',
    profileId: profileId || '',
  };

  await AsyncStorage.setItem(
    MEASUREMENTS_KEY,
    JSON.stringify([entry, ...entries]),
  );

  return entry;
};

export const removeMeasurement = async entryId => {
  const entries = await getMeasurements();
  await AsyncStorage.setItem(
    MEASUREMENTS_KEY,
    JSON.stringify(entries.filter(entry => entry.id !== entryId)),
  );
};
