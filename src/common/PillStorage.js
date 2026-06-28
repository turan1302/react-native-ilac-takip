import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDateKey } from './pillHelpers';

export const PILLS_STORAGE_KEY = 'pills';

export const getPills = async () => {
  const data = await AsyncStorage.getItem(PILLS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const addPill = async pill => {
  const pills = await getPills();
  const now = new Date();
  const newPill = {
    ...pill,
    id: Date.now().toString(),
    createdAt: now.toISOString(),
    startDate: formatDateKey(now),
  };

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

  const updatedPill = {
    ...pills[index],
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };

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
