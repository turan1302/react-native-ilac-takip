import AsyncStorage from '@react-native-async-storage/async-storage';

export const REMINDERS_ENABLED_KEY = 'reminders_enabled';

export const getRemindersEnabled = async () => {
  const value = await AsyncStorage.getItem(REMINDERS_ENABLED_KEY);

  if (value === null) {
    return true;
  }

  return value === 'true';
};

export const setRemindersEnabled = async enabled => {
  await AsyncStorage.setItem(
    REMINDERS_ENABLED_KEY,
    enabled ? 'true' : 'false',
  );
};
