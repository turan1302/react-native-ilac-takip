import { NativeModules, Platform } from 'react-native';
import notifee, { AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import { getTodayNudgeSnapshot, buildWidgetPayload } from './nextDoseHelpers';
import { getRemindersEnabled } from './ReminderStorage';

const NUDGE_CHANNEL_ID = 'medication-nudge';
export const NUDGE_NOTIFICATION_ID = 'nudge_next_dose';

const updateNativeWidget = async payload => {
  const module = NativeModules.NextDoseWidget;

  if (!module?.update) {
    return;
  }

  try {
    await module.update(payload);
  } catch (error) {
    console.warn('updateNativeWidget failed:', error);
  }
};

const ensureNudgeChannel = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  await notifee.createChannel({
    id: NUDGE_CHANNEL_ID,
    name: 'Sıradaki ilaç',
    description: 'Ana ekran bildiriminde sıradaki doz',
    importance: AndroidImportance.DEFAULT,
    sound: undefined,
    vibration: false,
  });
};

const updateOngoingNudge = async (snapshot, payload) => {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await ensureNudgeChannel();

    const remindersEnabled = await getRemindersEnabled();

    if (!remindersEnabled || snapshot.kind === 'empty' || snapshot.kind === 'done') {
      await notifee.cancelNotification(NUDGE_NOTIFICATION_ID);
      return;
    }

    const first = snapshot.items[0];

    await notifee.displayNotification({
      id: NUDGE_NOTIFICATION_ID,
      title: snapshot.headline,
      body: snapshot.subtitle,
      data: {
        grouped: snapshot.items.length > 1 ? '1' : '0',
        pillId: first?.pill?.id ? String(first.pill.id) : '',
        time: snapshot.time || '',
        items: payload.itemsJson,
      },
      android: {
        channelId: NUDGE_CHANNEL_ID,
        smallIcon: 'ic_notification',
        ongoing: true,
        autoCancel: false,
        onlyAlertOnce: true,
        importance: AndroidImportance.DEFAULT,
        visibility: AndroidVisibility.PUBLIC,
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        actions: [{ title: 'Aldım', pressAction: { id: 'take_all' } }],
      },
    });
  } catch (error) {
    console.warn('updateOngoingNudge failed:', error);
  }
};

export const syncHomeSurfaces = async () => {
  const snapshot = await getTodayNudgeSnapshot();
  const payload = buildWidgetPayload(snapshot);

  await updateNativeWidget(payload);
  await updateOngoingNudge(snapshot, payload);

  return snapshot;
};

export const clearHomeSurfaces = async () => {
  try {
    await notifee.cancelNotification(NUDGE_NOTIFICATION_ID);
  } catch (error) {
    console.warn('clearHomeSurfaces failed:', error);
  }
};
