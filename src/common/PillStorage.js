import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDateKey } from './pillHelpers';
import { DEFAULT_PROFILE_ID } from './ProfileStorage';
import { PILLS_STORAGE_KEY } from './storage/keys';

export { PILLS_STORAGE_KEY };

export const normalizePill = pill => {
  const source = pill && typeof pill === 'object' ? pill : {};

  return {
    ...source,
    profileId: source.profileId || DEFAULT_PROFILE_ID,
    prospectus: source.prospectus || '',
    stockQuantity:
      source.stockQuantity === '' || source.stockQuantity == null
        ? null
        : Number(source.stockQuantity),
    stockThreshold:
      source.stockThreshold === '' || source.stockThreshold == null
        ? 5
        : Number(source.stockThreshold),
    daysOfWeek: Array.isArray(source.daysOfWeek) ? source.daysOfWeek : [],
    daysOfMonth: Array.isArray(source.daysOfMonth) ? source.daysOfMonth : [],
    endDate: source.endDate || '',
  };
};

export const getPills = async () => {
  const data = await AsyncStorage.getItem(PILLS_STORAGE_KEY);
  const pills = data ? JSON.parse(data) : [];
  return pills.map(normalizePill);
};

export const getPillsForProfile = async profileId => {
  const pills = await getPills();
  const activeId = profileId || DEFAULT_PROFILE_ID;
  return pills.filter(pill => (pill.profileId || DEFAULT_PROFILE_ID) === activeId);
};

export const addPill = async pill => {
  const pills = await getPills();
  const now = new Date();
  const newPill = normalizePill({
    ...pill,
    id: Date.now().toString(),
    createdAt: now.toISOString(),
    startDate: pill.startDate || formatDateKey(now),
  });

  pills.push(newPill);
  await AsyncStorage.setItem(PILLS_STORAGE_KEY, JSON.stringify(pills));

  return newPill;
};

export const getPillById = async id => {
  const pills = await getPills();
  return pills.find(pill => pill.id === id) || null;
};

export const updatePill = async (id, updates) => {
  const pills = await getPills();
  const index = pills.findIndex(pill => pill.id === id);

  if (index === -1) {
    throw new Error('Pill not found');
  }

  const updatedPill = normalizePill({
    ...pills[index],
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  });

  pills[index] = updatedPill;
  await AsyncStorage.setItem(PILLS_STORAGE_KEY, JSON.stringify(pills));

  return updatedPill;
};

export const deletePill = async id => {
  const pills = await getPills();
  const filtered = pills.filter(pill => pill.id !== id);

  if (filtered.length === pills.length) {
    throw new Error('Pill not found');
  }

  await AsyncStorage.setItem(PILLS_STORAGE_KEY, JSON.stringify(filtered));
};

export const isLowStock = pill => {
  if (pill.stockQuantity == null) {
    return false;
  }

  return Number(pill.stockQuantity) <= Number(pill.stockThreshold ?? 5);
};
