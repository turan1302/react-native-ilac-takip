import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDateKey } from './pillHelpers';

export const NOTIFICATION_SCHEDULES_KEY = 'pill_notification_schedules';

export const getNotificationSchedules = async () => {
  const data = await AsyncStorage.getItem(NOTIFICATION_SCHEDULES_KEY);
  return data ? JSON.parse(data) : [];
};

export const getNotificationSchedulesForDate = async date => {
  const schedules = await getNotificationSchedules();
  return schedules.filter(schedule => schedule.date === date);
};

export const getNotificationSchedulesGroupedByDate = async () => {
  const schedules = await getNotificationSchedules();
  return schedules.reduce((grouped, schedule) => {
    if (!grouped[schedule.date]) {
      grouped[schedule.date] = [];
    }

    grouped[schedule.date].push(schedule);
    return grouped;
  }, {});
};

export const upsertNotificationSchedule = async ({
  pill,
  trigger,
  useExactAlarm = false,
  repeatFrequency = 'DAILY',
}) => {
  const schedules = await getNotificationSchedules();
  const triggerDate = new Date(trigger.timestamp);
  const date = formatDateKey(triggerDate);
  const now = new Date().toISOString();

  const entry = {
    id: pill.id,
    pillId: pill.id,
    pillName: pill.name,
    dosage: pill.dosage || '',
    type: pill.type || '',
    scheduledTime: pill.time || '',
    frequency: pill.frequency || 'Her Gün',
    date,
    triggerTimestamp: trigger.timestamp,
    repeatFrequency,
    useExactAlarm,
    updatedAt: now,
    createdAt:
      schedules.find(schedule => schedule.id === pill.id)?.createdAt || now,
  };

  const index = schedules.findIndex(schedule => schedule.id === pill.id);

  if (index >= 0) {
    schedules[index] = entry;
  } else {
    schedules.push(entry);
  }

  await AsyncStorage.setItem(
    NOTIFICATION_SCHEDULES_KEY,
    JSON.stringify(schedules),
  );

  return entry;
};

export const removeNotificationScheduleForPill = async pillId => {
  if (!pillId) {
    return;
  }

  const schedules = await getNotificationSchedules();
  const filtered = schedules.filter(schedule => schedule.pillId !== pillId);
  await AsyncStorage.setItem(
    NOTIFICATION_SCHEDULES_KEY,
    JSON.stringify(filtered),
  );
};

export const clearAllNotificationSchedules = async () => {
  await AsyncStorage.setItem(NOTIFICATION_SCHEDULES_KEY, JSON.stringify([]));
};
