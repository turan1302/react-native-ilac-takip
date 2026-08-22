import AsyncStorage from '@react-native-async-storage/async-storage';
import { IN_APP_DISMISSALS_KEY } from './storage/keys';

export { IN_APP_DISMISSALS_KEY };

export const getDismissals = async () => {
  const data = await AsyncStorage.getItem(IN_APP_DISMISSALS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getDismissedPillIdsForDate = async date => {
  const dismissals = await getDismissals();
  return new Set(
    dismissals
      .filter(item => item.date === date)
      .map(item => item.pillId),
  );
};

export const dismissInAppNotification = async (pillId, date) => {
  const dismissals = await getDismissals();
  const id = `${pillId}_${date}`;
  const index = dismissals.findIndex(item => item.id === id);

  const entry = {
    id,
    pillId,
    date,
    dismissedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    dismissals[index] = entry;
  } else {
    dismissals.push(entry);
  }

  await AsyncStorage.setItem(IN_APP_DISMISSALS_KEY, JSON.stringify(dismissals));
  return entry;
};

export const removeDismissalsForPill = async pillId => {
  const dismissals = await getDismissals();
  const filtered = dismissals.filter(item => item.pillId !== pillId);
  await AsyncStorage.setItem(IN_APP_DISMISSALS_KEY, JSON.stringify(filtered));
};

export const clearDismissalsForDate = async date => {
  const dismissals = await getDismissals();
  const filtered = dismissals.filter(item => item.date !== date);
  await AsyncStorage.setItem(IN_APP_DISMISSALS_KEY, JSON.stringify(filtered));
};
