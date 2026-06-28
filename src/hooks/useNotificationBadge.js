import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getNotificationBadgeCount } from '../common/inAppNotificationHelpers';

const useNotificationBadge = () => {
  const [badgeCount, setBadgeCount] = useState(0);

  const refreshBadge = useCallback(async () => {
    const count = await getNotificationBadgeCount();
    setBadgeCount(count);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshBadge();
    }, [refreshBadge]),
  );

  return { badgeCount, refreshBadge };
};

export default useNotificationBadge;
