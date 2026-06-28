import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import {
  getRemindersEnabled,
  setRemindersEnabled,
} from '../common/ReminderStorage';
import {
  cancelAllReminders,
  ensureNotificationPermissions,
  openBackgroundReminderSettings,
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
        Alert.alert(
          'Bildirim İzni Gerekli',
          'Hatırlatıcıları açmak için bildirim iznine ihtiyacımız var.',
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Ayarlara Git',
              onPress: () => openBackgroundReminderSettings(),
            },
          ],
        );
        return;
      }

      if (!permissionResult.alarmGranted) {
        Alert.alert(
          'Arka Plan Hatırlatıcı İzni',
          'Uygulama kapalıyken bildirim için pil tasarrufu ve otomatik başlatma izinlerini açın.',
          [
            { text: 'Devam Et', style: 'cancel' },
            {
              text: 'Ayarlara Git',
              onPress: () => openBackgroundReminderSettings(),
            },
          ],
        );
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
