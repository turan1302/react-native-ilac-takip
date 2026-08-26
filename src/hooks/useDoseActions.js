import { Alert } from 'react-native';
import { setPillIntakeStatus } from '../common/IntakeStorage';
import {
  notifyLowStockIfNeeded,
  rescheduleAllReminders,
  scheduleSnoozeReminder,
} from '../common/NotificationService';

const useDoseActions = (dateKey, reload) => {
  const takeDose = async item => {
    await setPillIntakeStatus(item.pill, dateKey, {
      status: 'taken',
      time: item.time || '',
    });
    await notifyLowStockIfNeeded(item.pill);
    await reload();
    rescheduleAllReminders();
  };

  const skipDose = async item => {
    await setPillIntakeStatus(item.pill, dateKey, {
      status: 'skipped',
      time: item.time || '',
    });
    await reload();
    rescheduleAllReminders();
  };

  const snoozeDose = item => {
    Alert.alert('Ertele', 'Bu dozu ne zaman hatırlatalım?', [
      {
        text: '10 dakika',
        onPress: async () => {
          await setPillIntakeStatus(item.pill, dateKey, {
            status: 'postponed',
            time: item.time || '',
            postponeUntil: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          });
          await scheduleSnoozeReminder(item.pill, item.time, 10);
          await reload();
          rescheduleAllReminders();
        },
      },
      {
        text: '1 saat',
        onPress: async () => {
          await setPillIntakeStatus(item.pill, dateKey, {
            status: 'postponed',
            time: item.time || '',
            postponeUntil: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          });
          await scheduleSnoozeReminder(item.pill, item.time, 60);
          await reload();
          rescheduleAllReminders();
        },
      },
      { text: 'Vazgeç', style: 'cancel' },
    ]);
  };

  return { takeDose, skipDose, snoozeDose };
};

export default useDoseActions;
