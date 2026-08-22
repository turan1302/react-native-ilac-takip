import { Alert } from 'react-native';
import { setPillIntakeStatus } from '../common/IntakeStorage';
import {
  notifyLowStockIfNeeded,
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
  };

  const skipDose = async item => {
    await setPillIntakeStatus(item.pill, dateKey, {
      status: 'skipped',
      time: item.time || '',
    });
    await reload();
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
        },
      },
      { text: 'Vazgeç', style: 'cancel' },
    ]);
  };

  return { takeDose, skipDose, snoozeDose };
};

export default useDoseActions;
