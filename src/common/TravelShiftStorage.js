import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PROFILE_ID } from './ProfileStorage';
import { TRAVEL_SHIFT_KEY } from './storage/keys';

export { TRAVEL_SHIFT_KEY };

const asMap = value =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export const getAllTravelShifts = async () => {
  const raw = await AsyncStorage.getItem(TRAVEL_SHIFT_KEY);
  if (!raw) {
    return {};
  }

  try {
    return asMap(JSON.parse(raw));
  } catch (error) {
    return {};
  }
};

export const getTravelShift = async (profileId = DEFAULT_PROFILE_ID) => {
  const all = await getAllTravelShifts();
  const shift = all[profileId || DEFAULT_PROFILE_ID];
  const offsetHours = Number(shift?.offsetHours) || 0;

  if (!shift?.dateKey || !offsetHours) {
    return null;
  }

  return {
    dateKey: shift.dateKey,
    offsetHours,
  };
};

export const setTravelShift = async (
  profileId,
  { dateKey, offsetHours } = {},
) => {
  const all = await getAllTravelShifts();
  const id = profileId || DEFAULT_PROFILE_ID;
  const hours = Number(offsetHours) || 0;

  if (!hours || !dateKey) {
    delete all[id];
  } else {
    all[id] = { dateKey, offsetHours: hours };
  }

  await AsyncStorage.setItem(TRAVEL_SHIFT_KEY, JSON.stringify(all));
  return all[id] || null;
};
