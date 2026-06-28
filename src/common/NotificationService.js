import { PermissionsAndroid, Platform } from 'react-native';
import notifee, {
  AlarmType,
  AndroidCategory,
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';
import { getPills } from './PillStorage';
import { getRemindersEnabled } from './ReminderStorage';
import {
  clearAllNotificationSchedules,
  removeNotificationScheduleForPill,
  upsertNotificationSchedule,
} from './NotificationStorage';
import { formatDateKey, parseDateKeyParts } from './pillHelpers';

const CHANNEL_ID = 'medication-reminders';

const shouldSchedulePill = pill => {
  const frequency = pill.frequency || 'Her Gün';

  if (frequency === 'İhtiyaç Halinde') {
    return false;
  }

  return Boolean(pill.time?.includes(':'));
};

const getPillStartDateParts = pill => {
  if (pill.startDate) {
    return parseDateKeyParts(pill.startDate);
  }

  if (pill.createdAt) {
    return parseDateKeyParts(formatDateKey(new Date(pill.createdAt)));
  }

  return parseDateKeyParts(formatDateKey(new Date()));
};

const getDailyTriggerDate = (hour, minute) => {
  const now = new Date();
  const trigger = new Date();
  trigger.setSeconds(0, 0);
  trigger.setHours(hour, minute, 0, 0);

  if (trigger.getTime() <= now.getTime()) {
    trigger.setDate(trigger.getDate() + 1);
  }

  return trigger;
};

const getWeeklyTriggerDate = (hour, minute, targetDayOfWeek) => {
  const now = new Date();
  const trigger = new Date();
  trigger.setSeconds(0, 0);
  trigger.setHours(hour, minute, 0, 0);

  let daysUntil = (targetDayOfWeek - trigger.getDay() + 7) % 7;

  if (daysUntil === 0 && trigger.getTime() <= now.getTime()) {
    daysUntil = 7;
  }

  trigger.setDate(trigger.getDate() + daysUntil);
  return trigger;
};

const buildTrigger = (pill, useExactAlarm = false) => {
  const [hour, minute] = pill.time.split(':').map(Number);
  const frequency = pill.frequency || 'Her Gün';

  let triggerDate;
  let repeatFrequency;

  if (frequency === 'Haftalık') {
    const { year, month, day } = getPillStartDateParts(pill);
    const anchor = new Date(year, month - 1, day);
    triggerDate = getWeeklyTriggerDate(hour, minute, anchor.getDay());
    repeatFrequency = RepeatFrequency.WEEKLY;
  } else {
    triggerDate = getDailyTriggerDate(hour, minute);
    repeatFrequency = RepeatFrequency.DAILY;
  }

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerDate.getTime(),
    repeatFrequency,
  };

  if (Platform.OS === 'android' && useExactAlarm) {
    trigger.alarmManager = {
      type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
    };
  }

  return trigger;
};

const buildNotification = pill => ({
  id: pill.id,
  title: 'İlaç Hatırlatması',
  body: `${pill.name} alma zamanınız geldi${pill.time ? ` (${pill.time})` : ''}.`,
  data: {
    pillId: pill.id,
  },
  android: {
    channelId: CHANNEL_ID,
    category: AndroidCategory.REMINDER,
    pressAction: {
      id: 'default',
      launchActivity: 'default',
    },
    smallIcon: 'ic_notification',
    importance: AndroidImportance.HIGH,
  },
  ios: {
    sound: 'default',
    interruptionLevel: 'timeSensitive',
  },
});

const requestAndroidNotificationPermission = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
};

export const hasNotificationPermission = async () => {
  const settings = await notifee.getNotificationSettings();
  return settings.authorizationStatus !== AuthorizationStatus.DENIED;
};

export const canUseExactAlarm = async () => {
  if (Platform.OS !== 'android') {
    return false;
  }

  const settings = await notifee.getNotificationSettings();
  return settings.android.alarm === AndroidNotificationSetting.ENABLED;
};

export const ensureNotificationPermissions = async () => {
  await requestAndroidNotificationPermission();

  const settings = await notifee.requestPermission();
  const notificationsGranted =
    settings.authorizationStatus !== AuthorizationStatus.DENIED;

  let alarmGranted = true;

  if (Platform.OS === 'android') {
    const androidSettings = await notifee.getNotificationSettings();
    alarmGranted =
      androidSettings.android.alarm !== AndroidNotificationSetting.DISABLED;
  }

  return { notificationsGranted, alarmGranted };
};

export const openReminderPermissionSettings = async () => {
  await notifee.openNotificationSettings(CHANNEL_ID);
};

export const openBackgroundReminderSettings = async () => {
  if (Platform.OS !== 'android') {
    await openReminderPermissionSettings();
    return;
  }

  await notifee.openAlarmPermissionSettings();
  await notifee.openBatteryOptimizationSettings();

  const powerManagerInfo = await notifee.getPowerManagerInfo();

  if (powerManagerInfo.activity) {
    await notifee.openPowerManagerSettings();
  }
};

const registerAlarmAccessWithSystem = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  const settings = await notifee.getNotificationSettings();

  if (settings.android.alarm === AndroidNotificationSetting.ENABLED) {
    return;
  }

  try {
    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + 60 * 1000,
      alarmManager: {
        type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
      },
    };

    await notifee.createTriggerNotification(
      {
        id: '__alarm_registration__',
        title: 'İlaç Takibi',
        body: 'Hatırlatıcı sistemi hazırlanıyor',
        android: {
          channelId: CHANNEL_ID,
          smallIcon: 'ic_notification',
        },
      },
      trigger,
    );

    await notifee.cancelTriggerNotification('__alarm_registration__');
  } catch (error) {
    console.warn('registerAlarmAccessWithSystem:', error);
  }
};

export const getReminderSetupStatus = async () => {
  const notificationsGranted = await hasNotificationPermission();
  let alarmGranted = true;
  let hasPowerManagerSettings = false;
  let batteryOptimizationEnabled = false;

  if (Platform.OS === 'android') {
    const settings = await notifee.getNotificationSettings();
    alarmGranted =
      settings.android.alarm !== AndroidNotificationSetting.DISABLED;

    const powerManagerInfo = await notifee.getPowerManagerInfo();
    hasPowerManagerSettings = Boolean(powerManagerInfo.activity);
    batteryOptimizationEnabled = await notifee.isBatteryOptimizationEnabled();
  }

  return {
    notificationsGranted,
    alarmGranted,
    hasPowerManagerSettings,
    batteryOptimizationEnabled,
    needsBackgroundSetup:
      !notificationsGranted || !alarmGranted || batteryOptimizationEnabled,
  };
};

export const initializeNotifications = async () => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'İlaç Hatırlatıcıları',
      description: 'İlaç alma saatlerinde gönderilen hatırlatmalar',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });

    await registerAlarmAccessWithSystem();
  }

  return ensureNotificationPermissions();
};

const createTriggerWithFallback = async (pill, useExactAlarm) => {
  const trigger = buildTrigger(pill, useExactAlarm);

  try {
    await notifee.createTriggerNotification(buildNotification(pill), trigger);
    return { trigger, useExactAlarm };
  } catch (error) {
    if (useExactAlarm) {
      const fallbackTrigger = buildTrigger(pill, false);
      await notifee.createTriggerNotification(
        buildNotification(pill),
        fallbackTrigger,
      );
      return { trigger: fallbackTrigger, useExactAlarm: false };
    }

    throw error;
  }
};

export const cancelPillReminder = async pillId => {
  if (!pillId) {
    return;
  }

  try {
    await notifee.cancelTriggerNotification(pillId);
    await removeNotificationScheduleForPill(pillId);
  } catch (error) {
    console.warn('cancelPillReminder failed:', error);
  }
};

export const schedulePillReminder = async pill => {
  if (!shouldSchedulePill(pill)) {
    await cancelPillReminder(pill.id);
    return false;
  }

  const remindersEnabled = await getRemindersEnabled();

  if (!remindersEnabled) {
    await cancelPillReminder(pill.id);
    return false;
  }

  const notificationsGranted = await hasNotificationPermission();

  if (!notificationsGranted) {
    return false;
  }

  await cancelPillReminder(pill.id);

  try {
    const { trigger, useExactAlarm: exactAlarmUsed } =
      await createTriggerWithFallback(pill, true);

    await upsertNotificationSchedule({
      pill,
      trigger,
      useExactAlarm: exactAlarmUsed,
      repeatFrequency:
        (pill.frequency || 'Her Gün') === 'Haftalık' ? 'WEEKLY' : 'DAILY',
    });

    return true;
  } catch (error) {
    console.warn('schedulePillReminder failed:', pill.id, error);
    return false;
  }
};

export const rescheduleAllReminders = async () => {
  const remindersEnabled = await getRemindersEnabled();

  try {
    const triggerIds = await notifee.getTriggerNotificationIds();
    await Promise.all(
      triggerIds.map(triggerId => notifee.cancelTriggerNotification(triggerId)),
    );
    await clearAllNotificationSchedules();
  } catch (error) {
    console.warn('cancel existing triggers failed:', error);
  }

  if (!remindersEnabled) {
    await clearAllNotificationSchedules();
    return { scheduled: 0, failed: 0 };
  }

  const notificationsGranted = await hasNotificationPermission();

  if (!notificationsGranted) {
    return { scheduled: 0, failed: 0, permissionDenied: true };
  }

  const pills = await getPills();
  let scheduled = 0;
  let failed = 0;

  for (const pill of pills) {
    const success = await schedulePillReminder(pill);

    if (success) {
      scheduled += 1;
    } else if (shouldSchedulePill(pill)) {
      failed += 1;
    }
  }

  return { scheduled, failed };
};

export const cancelAllReminders = async () => {
  try {
    const triggerIds = await notifee.getTriggerNotificationIds();
    await Promise.all(
      triggerIds.map(triggerId => notifee.cancelTriggerNotification(triggerId)),
    );
    await clearAllNotificationSchedules();
  } catch (error) {
    console.warn('cancelAllReminders failed:', error);
  }
};
