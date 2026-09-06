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
import { getDaysUntilStockRunsOut, getStockEtaLabel } from './stockHelpers';
import { getRemindersEnabled } from './ReminderStorage';
import {
  getIntakeMapForDate,
  getTodayDateKey,
  setPillIntakeStatus,
} from './IntakeStorage';
import {
  clearAllNotificationSchedules,
  removeNotificationScheduleForPill,
  upsertNotificationSchedule,
} from './NotificationStorage';
import { formatDateKey, shouldShowPillOnDate } from './pillHelpers';
import {
  getDoseKey,
  getMealRelationLabel,
  getPillTimes,
  isAsNeededFrequency,
} from './pillFormConstants';
import {
  applyOffsetToTime,
  getPillShiftOffsetMinutes,
} from './scheduleAdjustments';
import { getAllTravelShifts } from './TravelShiftStorage';
import {
  getQuietHoursEndDate,
  getQuietHoursSettings,
  isTimeInQuietHours,
} from './QuietHoursStorage';
import { joinNames, REFILL_DAYS_BEFORE } from './nextDoseHelpers';
import { markDosesTaken } from './DoseLinking';
import { clearHomeSurfaces, syncHomeSurfaces } from './WidgetService';

const CHANNEL_ID = 'medication-reminders';
const CATEGORY_ID = 'medication-reminder';
const GROUPED_CATEGORY_ID = 'medication-reminder-group';
const SCHEDULE_DAYS_AHEAD = 7;
const REFILL_HOUR = 10;
const FOLLOW_UP_MINUTES = 12;

const shouldSchedulePill = pill => {
  if (isAsNeededFrequency(pill.frequency)) {
    return false;
  }

  return getPillTimes(pill).length > 0;
};

const toNotificationId = (prefix, pillId, time = '', extra = '') =>
  [prefix, pillId, (time || '').replace(':', ''), extra].filter(Boolean).join('_');

const getUpcomingDatesForSlot = (pill, time, now, daysAhead, shiftsByProfile) => {
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
    const shiftMinutes = getPillShiftOffsetMinutes(
      pill,
      dateKey,
      shiftsByProfile,
    );
    if (shiftMinutes) {
      trigger.setMinutes(trigger.getMinutes() + shiftMinutes);
    }

    if (trigger.getTime() <= now.getTime()) {
      continue;
    }

    dates.push({ trigger, dateKey });
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
  const mealPart = meal ? ` · ${meal} alın` : '';

  return `${pill.name} alma zamanınız geldi${timePart}${mealPart}`;
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

const reminderActions = [
  { title: 'Aldım', pressAction: { id: 'take_all' } },
  { title: '10 dk sonra', pressAction: { id: 'snooze_10' } },
  { title: 'Bugün atla', pressAction: { id: 'skip_today' } },
];

const toItemsPayload = items =>
  JSON.stringify(
    items.map(item => ({
      pillId: String(item.pill.id),
      time: item.time || '',
    })),
  );

const buildNotification = (pill, time, id, displayTime = time) => ({
  id,
  title: 'İlaç saati',
  body: `${getNotificationBody(pill, displayTime || time)} Hadi al`,
  data: {
    pillId: String(pill.id),
    time: time || '',
    items: toItemsPayload([{ pill, time }]),
  },
  android: {
    ...androidReminderStyle,
    actions: reminderActions,
  },
  ios: iosReminderStyle,
});

const buildGroupedNotification = (items, id) => {
  const time = items[0]?.time || '';
  const displayTime = items[0]?.displayTime || time;
  const names = joinNames(items.map(item => item.pill.name));

  return {
    id,
    title: 'İlaç saati',
    body: `${names} alma zamanı (${displayTime}) Hadi al`,
    data: {
      grouped: '1',
      time,
      items: toItemsPayload(items),
      pillId: String(items[0]?.pill?.id || ''),
    },
    android: {
      ...androidReminderStyle,
      actions: reminderActions,
    },
    ios: {
      ...iosReminderStyle,
      categoryId: GROUPED_CATEGORY_ID,
    },
  };
};

const buildFollowUpNotification = (items, id) => {
  const time = items[0]?.time || '';
  const displayTime = items[0]?.displayTime || time;
  const names = joinNames(items.map(item => item.pill.name));
  const waitLabel = `${FOLLOW_UP_MINUTES} dk`;

  return {
    id,
    title: 'Hâlâ almadın',
    body:
      items.length === 1
        ? `${items[0].pill.name} henüz alınmadı (${displayTime}). ${waitLabel} geçti, hadi al`
        : `${names} henüz alınmadı (${displayTime}). ${waitLabel} geçti, hadi al`,
    data: {
      followUp: '1',
      grouped: items.length > 1 ? '1' : '0',
      time,
      items: toItemsPayload(items),
      pillId: String(items[0]?.pill?.id || ''),
    },
    android: {
      ...androidReminderStyle,
      actions: reminderActions,
    },
    ios: {
      ...iosReminderStyle,
      categoryId: items.length > 1 ? GROUPED_CATEGORY_ID : CATEGORY_ID,
    },
  };
};

const isDoseResolved = (intakeMap, pill, time) => {
  const intake =
    intakeMap.get(getDoseKey(pill.id, time)) || intakeMap.get(pill.id);

  if (!intake) {
    return false;
  }

  return (
    intake.status === 'taken' ||
    intake.taken ||
    intake.status === 'skipped' ||
    intake.status === 'missed' ||
    intake.status === 'postponed'
  );
};

const scheduleFollowUpNudges = async (pills, now, quiet, shiftsByProfile) => {
  const today = formatDateKey(now);
  const intakeMap = await getIntakeMapForDate(today);
  const buckets = new Map();

  for (const pill of pills) {
    if (!shouldSchedulePill(pill) || !shouldShowPillOnDate(pill, today)) {
      continue;
    }

    for (const slot of getScheduleSlots(pill)) {
      if (isDoseResolved(intakeMap, pill, slot.time)) {
        continue;
      }

      const [hour, minute] = (slot.time || '09:00').split(':').map(Number);
      const doseAt = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute,
        0,
        0,
      );
      const shiftMinutes = getPillShiftOffsetMinutes(
        pill,
        today,
        shiftsByProfile,
      );
      if (shiftMinutes) {
        doseAt.setMinutes(doseAt.getMinutes() + shiftMinutes);
      }

      if (doseAt.getTime() > now.getTime()) {
        continue;
      }

      if (isTimeInQuietHours(doseAt, quiet)) {
        continue;
      }

      let followAt = new Date(
        doseAt.getTime() + FOLLOW_UP_MINUTES * 60 * 1000,
      );

      if (isTimeInQuietHours(followAt, quiet)) {
        followAt = getQuietHoursEndDate(followAt, quiet);
      }

      if (followAt.getTime() <= now.getTime()) {
        continue;
      }

      const timestamp = followAt.getTime();
      const bucket = buckets.get(timestamp) || [];
      bucket.push({
        pill,
        time: slot.time,
        displayTime: applyOffsetToTime(slot.time, shiftMinutes),
      });
      buckets.set(timestamp, bucket);
    }
  }

  for (const [timestamp, bucketItems] of buckets.entries()) {
    const uniqueItems = uniquifyDoseItems(bucketItems);
    const timeStamp = (uniqueItems[0]?.time || '').replace(':', '');
    const id =
      uniqueItems.length === 1
        ? toNotificationId(
            'followup',
            uniqueItems[0].pill.id,
            uniqueItems[0].time,
          )
        : `followup_group_${timeStamp}`;

    try {
      await scheduleExactNotification(
        buildFollowUpNotification(uniqueItems, id),
        timestamp,
        true,
      );
    } catch (error) {
      console.warn('schedule follow-up failed:', error);
    }
  }
};

const buildRefillNotification = (pill, days, id) => {
  const body =
    days <= 0
      ? `${pill.name} bitti. Eczaneden / reçeteden yenile`
      : `${pill.name} ≈ ${days} gün sonra biter. Reçeteyi yenile`;

  return {
    id,
    title: 'Eczane hatırlatması',
    body,
    data: { refill: '1', pillId: String(pill.id) },
    android: {
      ...androidReminderStyle,
      category: AndroidCategory.REMINDER,
      actions: [],
    },
    ios: {
      ...iosReminderStyle,
      categoryId: undefined,
    },
  };
};

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
          { id: 'take_all', title: 'Aldım' },
          { id: 'snooze_10', title: '10 dk sonra' },
          { id: 'skip_today', title: 'Bugün atla' },
        ],
      },
      {
        id: GROUPED_CATEGORY_ID,
        actions: [
          { id: 'take_all', title: 'Aldım' },
          { id: 'snooze_10', title: '10 dk sonra' },
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
  const names = joinNames(items.map(item => item.pill.name));

  return {
    id: `digest_${timestamp}`,
    title: 'Hadi, ilaçlarını al',
    body: `Sessiz saatler bitti: ${names}`,
    data: {
      digest: '1',
      grouped: '1',
      items: toItemsPayload(items),
      pillId: String(items[0]?.pill?.id || ''),
      time: items[0]?.time || '',
    },
    android: {
      ...androidReminderStyle,
      actions: reminderActions,
    },
    ios: {
      ...iosReminderStyle,
      categoryId: GROUPED_CATEGORY_ID,
    },
  };
};

const uniquifyDoseItems = items => {
  const uniqueItems = [];
  const seen = new Set();

  items.forEach(item => {
    const key = `${item.pill.id}_${item.time}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueItems.push(item);
    }
  });

  return uniqueItems;
};

const getActionDoseItems = async data => {
  if (data?.items) {
    try {
      const parsed = typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
      if (Array.isArray(parsed) && parsed.length) {
        const items = [];
        for (const row of parsed) {
          const pill = await getPillById(row.pillId);
          if (pill) {
            items.push({ pill, time: row.time || '' });
          }
        }
        if (items.length) {
          return items;
        }
      }
    } catch (error) {
      console.warn('getActionDoseItems:', error);
    }
  }

  if (data?.pillId) {
    const pill = await getPillById(data.pillId);
    return pill ? [{ pill, time: data.time || '' }] : [];
  }

  return [];
};

const getNextRefillDate = now => {
  const todayAtTen = new Date(now.getFullYear(), now.getMonth(), now.getDate(), REFILL_HOUR, 0, 0, 0);

  if (todayAtTen.getTime() > now.getTime()) {
    return todayAtTen;
  }

  const tomorrow = new Date(todayAtTen);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

const isPillTriggerId = (triggerId, pillId) =>
  triggerId === pillId ||
  triggerId.startsWith(`dose_${pillId}_`) ||
  triggerId.startsWith(`snooze_${pillId}_`) ||
  triggerId.startsWith(`followup_${pillId}_`) ||
  triggerId.startsWith(`refill_${pillId}_`);

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
        getStockEtaLabel(latest) || 'Bitmeden yenileyin'
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
  const items = await getActionDoseItems(detail.notification?.data);

  if (!actionId || !items.length) {
    return;
  }

  const today = getTodayDateKey();

  if (actionId === 'take' || actionId === 'take_all') {
    const takenPills = await markDosesTaken(items);
    await Promise.all(takenPills.map(pill => notifyLowStockIfNeeded(pill)));
    await rescheduleAllReminders();
    return;
  }

  if (actionId === 'skip_today') {
    await Promise.all(
      items.map(({ pill, time }) =>
        setPillIntakeStatus(pill, today, { status: 'skipped', time }),
      ),
    );
    await rescheduleAllReminders();
    return;
  }

  if (actionId === 'snooze_10' || actionId === 'snooze_60') {
    const minutes = actionId === 'snooze_10' ? 10 : 60;
    await Promise.all(
      items.map(async ({ pill, time }) => {
        await setPillIntakeStatus(pill, today, {
          status: 'postponed',
          time,
          postponeUntil: new Date(Date.now() + minutes * 60 * 1000).toISOString(),
        });
        await scheduleSnoozeReminder(pill, time, minutes);
      }),
    );
    await syncHomeSurfaces();
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
    await clearHomeSurfaces();
    await syncHomeSurfaces();
    return { scheduled: 0, failed: 0 };
  }

  const notificationsGranted = await hasNotificationPermission();

  if (!notificationsGranted) {
    await syncHomeSurfaces();
    return { scheduled: 0, failed: 0, permissionDenied: true };
  }

  const [pills, quiet, shiftsByProfile] = await Promise.all([
    getPills(),
    getQuietHoursSettings(),
    getAllTravelShifts(),
  ]);
  const now = new Date();
  const digestMap = new Map();
  const timeBuckets = new Map();
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
        shiftsByProfile,
      );

      for (const { trigger, dateKey } of dates) {
        const displayTime = applyOffsetToTime(
          slot.time,
          getPillShiftOffsetMinutes(pill, dateKey, shiftsByProfile),
        );

        if (isTimeInQuietHours(trigger, quiet)) {
          const digestAt = getQuietHoursEndDate(trigger, quiet).getTime();
          const bucket = digestMap.get(digestAt) || [];
          bucket.push({ pill, time: slot.time, displayTime });
          digestMap.set(digestAt, bucket);
          pillScheduled = true;
          continue;
        }

        const timestamp = trigger.getTime();
        const bucket = timeBuckets.get(timestamp) || [];
        bucket.push({ pill, time: slot.time, displayTime });
        timeBuckets.set(timestamp, bucket);
        pillScheduled = true;
      }
    }

    if (pillScheduled) {
      scheduled += 1;
    } else {
      failed += 1;
    }
  }

  for (const [timestamp, bucketItems] of timeBuckets.entries()) {
    const uniqueItems = uniquifyDoseItems(bucketItems);
    const dateStamp = formatDateKey(new Date(timestamp)).replace(/-/g, '');
    const timeStamp = (uniqueItems[0]?.time || '').replace(':', '');
    const id =
      uniqueItems.length === 1
        ? toNotificationId('dose', uniqueItems[0].pill.id, uniqueItems[0].time, dateStamp)
        : `dose_group_${timeStamp}_${dateStamp}`;
    const notification =
      uniqueItems.length === 1
        ? buildNotification(
            uniqueItems[0].pill,
            uniqueItems[0].time,
            id,
            uniqueItems[0].displayTime,
          )
        : buildGroupedNotification(uniqueItems, id);

    try {
      const result = await scheduleExactNotification(notification, timestamp, true);

      await Promise.all(
        uniqueItems.map(item =>
          upsertNotificationSchedule({
            pill: item.pill,
            trigger: result.trigger,
            useExactAlarm: result.useExactAlarm,
            notificationId: `${id}_${item.pill.id}`,
            repeatFrequency: 'ONCE',
          }),
        ),
      );
    } catch (error) {
      console.warn('schedule dose failed:', error);
    }
  }

  for (const [timestamp, items] of digestMap.entries()) {
    const uniqueItems = uniquifyDoseItems(items);

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

  try {
    await scheduleFollowUpNudges(pills, now, quiet, shiftsByProfile);
  } catch (error) {
    console.warn('schedule follow-up nudges failed:', error);
  }

  const refillAt = getNextRefillDate(now);

  for (const pill of pills) {
    const days = getDaysUntilStockRunsOut(pill);

    if (days == null || days > REFILL_DAYS_BEFORE) {
      continue;
    }

    const dateStamp = formatDateKey(refillAt).replace(/-/g, '');
    const id = toNotificationId('refill', pill.id, '', dateStamp);

    try {
      await scheduleExactNotification(
        buildRefillNotification(pill, days, id),
        refillAt.getTime(),
        true,
      );
    } catch (error) {
      console.warn('schedule refill failed:', pill.id, error);
    }
  }

  await syncHomeSurfaces();

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
    await clearHomeSurfaces();
    await syncHomeSurfaces();
  } catch (error) {
    console.warn('cancelAllReminders failed:', error);
  }
};
