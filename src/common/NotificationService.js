import { PermissionsAndroid, Platform } from 'react-native';
import notifee, {
  AlarmType,
  AndroidCategory,
  AndroidImportance,
  AndroidNotificationSetting,
  AndroidVisibility,
  AuthorizationStatus,
  EventType,
  TriggerType,
} from '@notifee/react-native';
import { getPillById, getPills, isLowStock } from './PillStorage';
import { getStockEtaLabel } from './stockHelpers';
import { getRemindersEnabled } from './ReminderStorage';
import { getTodayDateKey, setPillIntakeStatus } from './IntakeStorage';
import {
  clearAllNotificationSchedules,
  removeNotificationScheduleForPill,
  upsertNotificationSchedule,
} from './NotificationStorage';
import { formatDateKey, shouldShowPillOnDate } from './pillHelpers';
import { getMealRelationLabel, getPillTimes, isAsNeededFrequency } from './pillFormConstants';
import {
  getQuietHoursEndDate,
  getQuietHoursSettings,
  isTimeInQuietHours,
} from './QuietHoursStorage';

const CHANNEL_ID = 'medication-reminders';
const CATEGORY_ID = 'medication-reminder';
const SCHEDULE_DAYS_AHEAD = 7;

const shouldSchedulePill = pill => {
  if (isAsNeededFrequency(pill.frequency)) {
    return false;
  }

  return getPillTimes(pill).length > 0;
};

const toNotificationId = (prefix, pillId, time = '', extra = '') =>
  [prefix, pillId, (time || '').replace(':', ''), extra].filter(Boolean).join('_');

const getUpcomingDatesForSlot = (pill, time, now, daysAhead) => {
  const [hour, minute] = (time || '09:00').split(':').map(Number);
  const dates = [];

  for (let offset = 0; offset <= daysAhead; offset += 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const dateKey = formatDateKey(day);

    if (!shouldShowPillOnDate(pill, dateKey)) {
      continue;
    }

    const trigger = new Date(day);
    trigger.setHours(hour, minute, 0, 0);

    if (trigger.getTime() <= now.getTime()) {
      continue;
    }

    dates.push(trigger);
  }

  return dates;
};

const attachExactAlarm = (trigger, useExactAlarm) => {
  if (Platform.OS === 'android' && useExactAlarm) {
    trigger.alarmManager = {
      type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
    };
  }

  return trigger;
};

const getScheduleSlots = pill =>
  getPillTimes(pill).map(time => ({ time }));

const getNotificationBody = (pill, time) => {
  const meal = getMealRelationLabel(pill.mealRelation);
  const timePart = time ? ` (${time})` : '';
  const mealPart = meal ? ` ${meal} alın.` : '';

  return `${pill.name} alma zamanınız geldi${timePart}.${mealPart}`;
};

const androidReminderStyle = {
  channelId: CHANNEL_ID,
  category: AndroidCategory.REMINDER,
  pressAction: {
    id: 'default',
    launchActivity: 'default',
  },
  smallIcon: 'ic_notification',
  importance: AndroidImportance.HIGH,
  visibility: AndroidVisibility.PUBLIC,
  sound: 'default',
  vibrationPattern: [300, 500, 300, 500],
  showTimestamp: true,
  autoCancel: true,
  lightUpScreen: true,
};

const iosReminderStyle = {
  categoryId: CATEGORY_ID,
  sound: 'default',
  interruptionLevel: 'timeSensitive',
  foregroundPresentationOptions: {
    badge: true,
    sound: true,
    banner: true,
    list: true,
  },
};

const buildNotification = (pill, time, id) => ({
  id,
  title: 'İlaç Hatırlatması',
  body: getNotificationBody(pill, time),
  data: {
    pillId: String(pill.id),
    time: time || '',
  },
  android: {
    ...androidReminderStyle,
    actions: [
      { title: '10 dk sonra', pressAction: { id: 'snooze_10' } },
      { title: 'Daha sonra', pressAction: { id: 'snooze_60' } },
      { title: 'Bugün atla', pressAction: { id: 'skip_today' } },
    ],
  },
  ios: iosReminderStyle,
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
        lights: true,
      });

      await registerAlarmAccessWithSystem();
    }
  } catch (error) {
    console.warn('initializeNotifications setup:', error);
  }

  return permissionResult;
};

const scheduleExactNotification = async (notification, timestamp, useExactAlarm) => {
  const trigger = attachExactAlarm(
    {
      type: TriggerType.TIMESTAMP,
      timestamp,
    },
    useExactAlarm,
  );

  try {
    await notifee.createTriggerNotification(notification, trigger);
    return { trigger, useExactAlarm: true };
  } catch (error) {
    if (!useExactAlarm) {
      throw error;
    }

    const fallback = attachExactAlarm(
      {
        type: TriggerType.TIMESTAMP,
        timestamp,
      },
      false,
    );
    await notifee.createTriggerNotification(notification, fallback);
    return { trigger: fallback, useExactAlarm: false };
  }
};

const buildDigestNotification = (items, timestamp) => {
  const names = items
    .map(item =>
      item.time ? `${item.pill.name} (${item.time})` : item.pill.name,
    )
    .join(', ');

  return {
    id: `digest_${timestamp}`,
    title: 'Sabah hatırlatması',
    body: `Sessiz saatlerdeki ilaçlarınız: ${names}`,
    data: { digest: '1' },
    android: androidReminderStyle,
    ios: {
      ...iosReminderStyle,
      categoryId: undefined,
    },
  };
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

  const quiet = await getQuietHoursSettings();
  let fireAt = new Date(Date.now() + minutes * 60 * 1000);

  if (isTimeInQuietHours(fireAt, quiet)) {
    fireAt = getQuietHoursEndDate(fireAt, quiet);
  }

  try {
    await scheduleExactNotification(
      buildNotification(
        pill,
        time,
        toNotificationId('snooze', pill.id, time, String(minutes)),
      ),
      fireAt.getTime(),
      true,
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
      body: `${latest.name} stoğu ${latest.stockQuantity} kaldı. ${
        getStockEtaLabel(latest) || 'Bitmeden yenileyin.'
      }`,
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

  const [pills, quiet] = await Promise.all([
    getPills(),
    getQuietHoursSettings(),
  ]);
  const now = new Date();
  const digestMap = new Map();
  let scheduled = 0;
  let failed = 0;

  for (const pill of pills) {
    if (!shouldSchedulePill(pill)) {
      continue;
    }

    let pillScheduled = false;

    for (const slot of getScheduleSlots(pill)) {
      const dates = getUpcomingDatesForSlot(
        pill,
        slot.time,
        now,
        SCHEDULE_DAYS_AHEAD,
      );

      for (const date of dates) {
        if (isTimeInQuietHours(date, quiet)) {
          const digestAt = getQuietHoursEndDate(date, quiet).getTime();
          const bucket = digestMap.get(digestAt) || [];
          bucket.push({ pill, time: slot.time });
          digestMap.set(digestAt, bucket);
          pillScheduled = true;
          continue;
        }

        const dateStamp = formatDateKey(date).replace(/-/g, '');
        const id = toNotificationId('dose', pill.id, slot.time, dateStamp);

        try {
          const result = await scheduleExactNotification(
            buildNotification(pill, slot.time, id),
            date.getTime(),
            true,
          );
          pillScheduled = true;
          await upsertNotificationSchedule({
            pill,
            trigger: result.trigger,
            useExactAlarm: result.useExactAlarm,
            notificationId: id,
            repeatFrequency: 'ONCE',
          });
        } catch (error) {
          console.warn('schedule dose failed:', pill.id, error);
        }
      }
    }

    if (pillScheduled) {
      scheduled += 1;
    } else {
      failed += 1;
    }
  }

  for (const [timestamp, items] of digestMap.entries()) {
    const uniqueItems = [];
    const seen = new Set();

    items.forEach(item => {
      const key = `${item.pill.id}_${item.time}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueItems.push(item);
      }
    });

    try {
      await scheduleExactNotification(
        buildDigestNotification(uniqueItems, timestamp),
        timestamp,
        true,
      );
    } catch (error) {
      console.warn('schedule digest failed:', error);
    }
  }

  return { scheduled, failed };
};

export const schedulePillReminder = async () => {
  const result = await rescheduleAllReminders();
  return !result.permissionDenied;
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
