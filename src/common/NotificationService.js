import { PermissionsAndroid, Platform } from 'react-native';
import notifee, {
  AlarmType,
  AndroidCategory,
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  EventType,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';
import { getPillById, getPills, isLowStock } from './PillStorage';
import { getRemindersEnabled } from './ReminderStorage';
import { getTodayDateKey, setPillIntakeStatus } from './IntakeStorage';
import {
  clearAllNotificationSchedules,
  removeNotificationScheduleForPill,
  upsertNotificationSchedule,
} from './NotificationStorage';
import { formatDateKey, parseDateKeyParts, shouldShowPillOnDate } from './pillHelpers';
import { getPillTimes, isAsNeededFrequency } from './pillFormConstants';

const CHANNEL_ID = 'medication-reminders';
const CATEGORY_ID = 'medication-reminder';

const shouldSchedulePill = pill => {
  if (isAsNeededFrequency(pill.frequency)) {
    return false;
  }

  return getPillTimes(pill).length > 0;
};

const toNotificationId = (prefix, pillId, time = '', extra = '') =>
  [prefix, pillId, (time || '').replace(':', ''), extra].filter(Boolean).join('_');

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

const getNextMonthDayDate = (hour, minute, daysOfMonth = []) => {
  const now = new Date();

  for (let offset = 0; offset < 62; offset += 1) {
    const candidate = new Date();
    candidate.setSeconds(0, 0);
    candidate.setHours(hour, minute, 0, 0);
    candidate.setDate(candidate.getDate() + offset);

    if (!daysOfMonth.includes(candidate.getDate())) {
      continue;
    }

    if (candidate.getTime() <= now.getTime()) {
      continue;
    }

    return candidate;
  }

  return null;
};

const attachExactAlarm = (trigger, useExactAlarm) => {
  if (Platform.OS === 'android' && useExactAlarm) {
    trigger.alarmManager = {
      type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
    };
  }

  return trigger;
};

const buildTriggerForTime = (pill, time, extra, useExactAlarm = false) => {
  const [hour, minute] = time.split(':').map(Number);
  const frequency = pill.frequency || 'Her Gün';
  let triggerDate = null;
  let repeatFrequency = RepeatFrequency.DAILY;

  if (frequency === 'Haftalık') {
    const { year, month, day } = getPillStartDateParts(pill);
    const anchor = new Date(year, month - 1, day);
    triggerDate = getWeeklyTriggerDate(hour, minute, extra ?? anchor.getDay());
    repeatFrequency = RepeatFrequency.WEEKLY;
  } else if (frequency === 'Haftada 2 Gün') {
    triggerDate = getWeeklyTriggerDate(hour, minute, extra);
    repeatFrequency = RepeatFrequency.WEEKLY;
  } else if (frequency === 'Ayın Belirli Günleri') {
    triggerDate = getNextMonthDayDate(hour, minute, pill.daysOfMonth);
    repeatFrequency = undefined;
  } else {
    triggerDate = getDailyTriggerDate(hour, minute);
    repeatFrequency = RepeatFrequency.DAILY;
  }

  if (!triggerDate) {
    return null;
  }

  const dateKey = formatDateKey(triggerDate);

  if (pill.endDate && dateKey > pill.endDate) {
    return null;
  }

  if (pill.startDate && dateKey < pill.startDate) {
    const [year, month, day] = pill.startDate.split('-').map(Number);
    triggerDate = new Date(year, month - 1, day, hour, minute, 0, 0);
  }

  if (!shouldShowPillOnDate(pill, formatDateKey(triggerDate))) {
    return null;
  }

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerDate.getTime(),
  };

  if (repeatFrequency) {
    trigger.repeatFrequency = repeatFrequency;
  }

  return attachExactAlarm(trigger, useExactAlarm);
};

const getScheduleSlots = pill => {
  const times = getPillTimes(pill);
  const frequency = pill.frequency || 'Her Gün';

  if (frequency === 'Haftada 2 Gün') {
    return (pill.daysOfWeek || []).flatMap(weekday =>
      times.map(time => ({ time, extra: weekday })),
    );
  }

  if (frequency === 'Haftalık') {
    const { year, month, day } = getPillStartDateParts(pill);
    const weekday = new Date(year, month - 1, day).getDay();
    return times.map(time => ({ time, extra: weekday }));
  }

  return times.map(time => ({ time, extra: '' }));
};

const buildNotification = (pill, time, id) => ({
  id,
  title: 'İlaç Hatırlatması',
  body: `${pill.name} alma zamanınız geldi${time ? ` (${time})` : ''}.`,
  data: {
    pillId: String(pill.id),
    time: time || '',
  },
  android: {
    channelId: CHANNEL_ID,
    category: AndroidCategory.REMINDER,
    pressAction: {
      id: 'default',
      launchActivity: 'default',
    },
    actions: [
      { title: '10 dk sonra', pressAction: { id: 'snooze_10' } },
      { title: 'Daha sonra', pressAction: { id: 'snooze_60' } },
      { title: 'Bugün atla', pressAction: { id: 'skip_today' } },
    ],
    smallIcon: 'ic_notification',
    importance: AndroidImportance.HIGH,
  },
  ios: {
    categoryId: CATEGORY_ID,
    sound: 'default',
    interruptionLevel: 'active',
    foregroundPresentationOptions: {
      badge: true,
      sound: true,
      banner: true,
      list: true,
    },
  },
});

const isNotificationAuthorized = authorizationStatus =>
  authorizationStatus === AuthorizationStatus.AUTHORIZED ||
  authorizationStatus === AuthorizationStatus.PROVISIONAL ||
  authorizationStatus === AuthorizationStatus.EPHEMERAL;

export const getPermissionAlertCopy = kind => {
  const isIOS = Platform.OS === 'ios';

  if (kind === 'notifications') {
    return {
      title: 'Bildirim İzni Gerekli',
      message: isIOS
        ? 'İlaç hatırlatmaları için bildirim iznine ihtiyacımız var. Ayarlar > Bildirimler > İlaç Takibi üzerinden izin verebilirsiniz.'
        : 'İlaç hatırlatmaları için bildirim iznine ihtiyacımız var. Ayarlar > Uygulamalar > İlaç Takibi > Bildirimler üzerinden izin verebilirsiniz.',
    };
  }

  if (kind === 'background') {
    return {
      title: isIOS ? 'Bildirim İzni' : 'Arka Plan Hatırlatıcı İzni',
      message: isIOS
        ? 'Uygulama kapalıyken hatırlatma almak için Ayarlar > Bildirimler > İlaç Takibi yolundan bildirimleri açık tutun.'
        : 'Uygulama kapalıyken bildirim almak için izinleri açmanız gerekir. Listede görünmüyorsa önce bir ilaç ekleyin, ardından açılan ayarlardan pil ve otomatik başlatma izinlerini verin.',
    };
  }

  return {
    title: isIOS ? 'Bildirim Ayarları' : 'Arka Plan İzinleri',
    message: isIOS
      ? 'Açılan ekranda Bildirimler’i açın. Böylece uygulama kapalıyken de ilaç hatırlatmaları gelir.'
      : 'Sırasıyla açılan ekranlarda:\n\n1. Alarmlar ve hatırlatıcılar → İlaç Takibi\'ni açın (listede yoksa ilaç ekleyip uygulamayı yeniden açın)\n2. Pil tasarrufu → Kısıtlama yok\n3. Otomatik başlatma → Açık (Xiaomi/Redmi)',
  };
};

export const getBackgroundSetupCardCopy = () => ({
  title: 'Bildirim izni gerekli',
  subtitle:
    Platform.OS === 'ios'
      ? 'Hatırlatıcılar için Ayarlar’dan bildirimleri açın'
      : 'İlaç hatırlatmalarını almak için bildirim iznini açın',
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
  return isNotificationAuthorized(settings.authorizationStatus);
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

  const settings = await notifee.requestPermission({
    alert: true,
    badge: true,
    sound: true,
  });
  const notificationsGranted = isNotificationAuthorized(
    settings.authorizationStatus,
  );

  let alarmGranted = true;

  if (Platform.OS === 'android') {
    const androidSettings = await notifee.getNotificationSettings();
    alarmGranted =
      androidSettings.android.alarm !== AndroidNotificationSetting.DISABLED;
  }

  return { notificationsGranted, alarmGranted };
};

export const openReminderPermissionSettings = async () => {
  if (Platform.OS === 'ios') {
    await notifee.openNotificationSettings();
    return;
  }

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
    needsBackgroundSetup: !notificationsGranted,
  };
};

export const initializeNotifications = async () => {
  const permissionResult = await ensureNotificationPermissions();

  try {
    await notifee.setNotificationCategories([
      {
        id: CATEGORY_ID,
        actions: [
          { id: 'snooze_10', title: '10 dk sonra' },
          { id: 'snooze_60', title: 'Daha sonra' },
          { id: 'skip_today', title: 'Bugün atla' },
        ],
      },
    ]);

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
  } catch (error) {
    console.warn('initializeNotifications setup:', error);
  }

  return permissionResult;
};

const createTriggerWithFallback = async (pill, time, extra, useExactAlarm) => {
  const trigger = buildTriggerForTime(pill, time, extra, useExactAlarm);

  if (!trigger) {
    return null;
  }

  const id = toNotificationId('dose', pill.id, time, extra);
  const notification = buildNotification(pill, time, id);

  try {
    await notifee.createTriggerNotification(notification, trigger);
    return { trigger, useExactAlarm, id };
  } catch (error) {
    if (useExactAlarm) {
      const fallbackTrigger = buildTriggerForTime(pill, time, extra, false);
      if (!fallbackTrigger) {
        throw error;
      }

      await notifee.createTriggerNotification(notification, fallbackTrigger);
      return { trigger: fallbackTrigger, useExactAlarm: false, id };
    }

    throw error;
  }
};

const isPillTriggerId = (triggerId, pillId) =>
  triggerId === pillId ||
  triggerId.startsWith(`dose_${pillId}_`) ||
  triggerId.startsWith(`snooze_${pillId}_`);

export const cancelPillReminder = async pillId => {
  if (!pillId) {
    return;
  }

  try {
    const triggerIds = await notifee.getTriggerNotificationIds();
    await Promise.all(
      triggerIds
        .filter(triggerId => isPillTriggerId(triggerId, pillId))
        .map(triggerId => notifee.cancelTriggerNotification(triggerId)),
    );
    await removeNotificationScheduleForPill(pillId);
  } catch (error) {
    console.warn('cancelPillReminder failed:', error);
  }
};

export const scheduleSnoozeReminder = async (pill, time, minutes) => {
  if (!pill?.id) {
    return false;
  }

  const trigger = attachExactAlarm(
    {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + minutes * 60 * 1000,
    },
    true,
  );

  try {
    await notifee.createTriggerNotification(
      buildNotification(
        pill,
        time,
        toNotificationId('snooze', pill.id, time, String(minutes)),
      ),
      trigger,
    );
    return true;
  } catch (error) {
    console.warn('scheduleSnoozeReminder failed:', error);
    return false;
  }
};

export const notifyLowStockIfNeeded = async pill => {
  const latest = (await getPillById(pill.id)) || pill;

  if (!isLowStock(latest)) {
    return;
  }

  try {
    await notifee.displayNotification({
      id: `stock_${latest.id}`,
      title: 'Stok azalıyor',
      body: `${latest.name} stoğu ${latest.stockQuantity} kaldı. Bitmeden yenileyin.`,
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_notification',
        importance: AndroidImportance.HIGH,
      },
      ios: {
        sound: 'default',
      },
    });
  } catch (error) {
    console.warn('notifyLowStockIfNeeded failed:', error);
  }
};

export const handleNotificationAction = async ({ type, detail }) => {
  if (type !== EventType.ACTION_PRESS) {
    return;
  }

  const actionId = detail.pressAction?.id;
  const pillId = detail.notification?.data?.pillId;
  const time = detail.notification?.data?.time || '';

  if (!pillId || !actionId) {
    return;
  }

  const pill = await getPillById(pillId);

  if (!pill) {
    return;
  }

  const today = getTodayDateKey();

  if (actionId === 'skip_today') {
    await setPillIntakeStatus(pill, today, { status: 'skipped', time });
    return;
  }

  if (actionId === 'snooze_10' || actionId === 'snooze_60') {
    const minutes = actionId === 'snooze_10' ? 10 : 60;
    await setPillIntakeStatus(pill, today, {
      status: 'postponed',
      time,
      postponeUntil: new Date(Date.now() + minutes * 60 * 1000).toISOString(),
    });
    await scheduleSnoozeReminder(pill, time, minutes);
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
    const slots = getScheduleSlots(pill);
    let scheduledAny = false;

    for (const slot of slots) {
      const result = await createTriggerWithFallback(
        pill,
        slot.time,
        slot.extra,
        true,
      );

      if (!result) {
        continue;
      }

      scheduledAny = true;
      await upsertNotificationSchedule({
        pill,
        trigger: result.trigger,
        useExactAlarm: result.useExactAlarm,
        notificationId: result.id,
        repeatFrequency:
          result.trigger.repeatFrequency === RepeatFrequency.WEEKLY
            ? 'WEEKLY'
            : 'DAILY',
      });
    }

    return scheduledAny;
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
