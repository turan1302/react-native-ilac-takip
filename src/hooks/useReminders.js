import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import {
  getRemindersEnabled,
  setRemindersEnabled,
} from '../common/ReminderStorage';
import {
  cancelAllReminders,
  ensureNotificationPermissions,
  getPermissionAlertCopy,
  openBackgroundReminderSettings,
  openReminderPermissionSettings,
  rescheduleAllReminders,
} from '../common/NotificationService';

const useReminders = () => {
  const [remindersEnabled, setRemindersEnabledState] = useState(true);

  const loadRemindersState = useCallback(async () => {
    const enabled = await getRemindersEnabled();
    setRemindersEnabledState(enabled);
  }, []);

  const toggleReminders = useCallback(async () => {
    const newValue = !remindersEnabled;

    if (newValue) {
      const permissionResult = await ensureNotificationPermissions();

      if (!permissionResult.notificationsGranted) {
        const copy = getPermissionAlertCopy('notifications');
        Alert.alert(copy.title, copy.message, [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Ayarlara Git',
            onPress: () => openReminderPermissionSettings(),
          },
        ]);
        return;
      }

      if (!permissionResult.alarmGranted) {
        const copy = getPermissionAlertCopy('background');
        Alert.alert(copy.title, copy.message, [
          { text: 'Devam Et', style: 'cancel' },
          {
            text: 'Ayarlara Git',
            onPress: () => openBackgroundReminderSettings(),
          },
        ]);
      }
    }

    setRemindersEnabledState(newValue);
    await setRemindersEnabled(newValue);

    if (newValue) {
      await rescheduleAllReminders();
    } else {
      await cancelAllReminders();
    }
  }, [remindersEnabled]);

  return {
    remindersEnabled,
    loadRemindersState,
    toggleReminders,
  };
};

export default useReminders;
