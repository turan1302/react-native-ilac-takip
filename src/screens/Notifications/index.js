import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getTodayDateKey,
  togglePillIntake,
} from '../../common/IntakeStorage';
import { dismissInAppNotification } from '../../common/InAppNotificationStorage';
import { getMissedNotifications } from '../../common/inAppNotificationHelpers';
import EmptyState from '../../components/Notifications/EmptyState';
import Header from '../../components/Notifications/Header';
import NotificationSection from '../../components/Notifications/NotificationSection';
import PageIntro from '../../components/Notifications/PageIntro';
import styles, { COLORS } from './styles';

const Notifications = () => {
  const navigation = useNavigation();
  const today = getTodayDateKey();
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    const missed = await getMissedNotifications(today);
    setNotifications(missed);
  }, [today]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications]),
  );

  const activeNotifications = useMemo(
    () => notifications.filter(item => !item.dismissed),
    [notifications],
  );

  const dismissedNotifications = useMemo(
    () => notifications.filter(item => item.dismissed),
    [notifications],
  );

  const handleTake = async item => {
    await togglePillIntake(item.pill, today, true);
    await loadNotifications();
  };

  const handleDismiss = async item => {
    await dismissInAppNotification(item.pillId, today);
    await loadNotifications();
  };

  const handleEditPill = item => {
    navigation.navigate('EditPill', { pillId: item.pillId });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const hasNotifications = notifications.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header onGoBack={handleGoBack} />

        <PageIntro />

        {!hasNotifications ? (
          <EmptyState />
        ) : (
          <>
            <NotificationSection
              title="BEKLEYEN HATIRLATMALAR"
              items={activeNotifications}
              onTake={handleTake}
              onDismiss={handleDismiss}
              onPressEdit={handleEditPill}
            />
            <NotificationSection
              title="PAS GEÇİLENLER"
              items={dismissedNotifications}
              onTake={handleTake}
              onDismiss={handleDismiss}
              onPressEdit={handleEditPill}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notifications;
