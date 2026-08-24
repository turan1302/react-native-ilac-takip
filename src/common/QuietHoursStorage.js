import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  QUIET_HOURS_ENABLED_KEY,
  QUIET_HOURS_END_KEY,
  QUIET_HOURS_START_KEY,
} from './storage/keys';

export const DEFAULT_QUIET_START = '23:00';
export const DEFAULT_QUIET_END = '07:00';

const timeToMinutes = time => {
  const [hour, minute] = (time || '00:00').split(':').map(Number);
  return hour * 60 + minute;
};

export const getQuietHoursSettings = async () => {
  const [enabled, start, end] = await Promise.all([
    AsyncStorage.getItem(QUIET_HOURS_ENABLED_KEY),
    AsyncStorage.getItem(QUIET_HOURS_START_KEY),
    AsyncStorage.getItem(QUIET_HOURS_END_KEY),
  ]);

  return {
    enabled: enabled === null ? true : enabled === 'true',
    start: start || DEFAULT_QUIET_START,
    end: end || DEFAULT_QUIET_END,
  };
};

export const setQuietHoursEnabled = async enabled => {
  await AsyncStorage.setItem(QUIET_HOURS_ENABLED_KEY, enabled ? 'true' : 'false');
};

export const setQuietHoursRange = async ({ start, end }) => {
  await AsyncStorage.multiSet([
    [QUIET_HOURS_START_KEY, start],
    [QUIET_HOURS_END_KEY, end],
  ]);
};

export const isTimeInQuietHours = (date, settings) => {
  if (!settings?.enabled) {
    return false;
  }

  const minutes = date.getHours() * 60 + date.getMinutes();
  const start = timeToMinutes(settings.start);
  const end = timeToMinutes(settings.end);

  if (start === end) {
    return false;
  }

  if (start < end) {
    return minutes >= start && minutes < end;
  }

  return minutes >= start || minutes < end;
};

export const getQuietHoursEndDate = (fromDate, settings) => {
  const [hour, minute] = (settings.end || DEFAULT_QUIET_END)
    .split(':')
    .map(Number);
  const next = new Date(fromDate);
  next.setSeconds(0, 0);
  next.setHours(hour, minute, 0, 0);

  if (next.getTime() <= fromDate.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  return next;
};
