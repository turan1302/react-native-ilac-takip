import React, { useEffect } from 'react'
import { AppState, Linking, Platform } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import Routes from "./src/routes";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AlertNotificationRoot } from "react-native-alert-notification";
import ImmersiveMode from "react-native-immersive-mode";
import { ProfileProvider } from './src/common/ProfileContext';
import { ThemeProvider } from './src/common/ThemeContext';
import {
    handleNotificationAction,
    initializeNotifications,
    notifyLowStockIfNeeded,
    rescheduleAllReminders,
} from './src/common/NotificationService';
import { subscribeDoseDeepLinks } from './src/common/DoseLinking';
import { syncHomeSurfaces } from './src/common/WidgetService';
import { seedDemoData } from './src/common/seedDemoData';

const App = () => {

  useEffect(() => {
    if (Platform.OS === 'android') {
      ImmersiveMode.setBarMode("FullSticky");
      ImmersiveMode.setBarTranslucent(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let appStateSubscription;

    const waitForActiveApp = () =>
      new Promise(resolve => {
        if (AppState.currentState === 'active') {
          resolve();
          return;
        }

        appStateSubscription = AppState.addEventListener('change', state => {
          if (state === 'active') {
            appStateSubscription?.remove();
            appStateSubscription = undefined;
            resolve();
          }
        });
      });

    const setupNotifications = async () => {
      try {
        await waitForActiveApp();
        // Splash 2 sn; sistem izni splash bitince çıksın (iOS/Android)
        await new Promise(resolve => setTimeout(resolve, 2400));
        if (cancelled) {
          return;
        }

        const permissionResult = await initializeNotifications();
        if (cancelled) {
          return;
        }

        if (permissionResult.notificationsGranted) {
          await rescheduleAllReminders();
        } else {
          await syncHomeSurfaces();
        }
      } catch (error) {
        console.warn('Notification setup failed:', error);
      }
    };

    setupNotifications();

    const unsubscribeDeepLinks = subscribeDoseDeepLinks(async takenPills => {
      await Promise.all(takenPills.map(pill => notifyLowStockIfNeeded(pill)));
      await rescheduleAllReminders();
    });

    const handleSeedLink = async ({ url }) => {
      if (url && String(url).includes('seed-demo')) {
        try {
          await seedDemoData({ force: true });
        } catch (error) {
          console.warn('seedDemoData failed:', error);
        }
      }
    };

    Linking.getInitialURL().then(url => handleSeedLink({ url }));
    const seedSub = Linking.addEventListener('url', handleSeedLink);

    const unsubscribe = notifee.onForegroundEvent(event => {
      if (event.type === EventType.ACTION_PRESS) {
        handleNotificationAction(event);
      }

      if (event.type === EventType.DELIVERED) {
        rescheduleAllReminders();
      }
    });

    const appResume = AppState.addEventListener('change', state => {
      if (state === 'active') {
        rescheduleAllReminders();
      }
    });

    return () => {
      cancelled = true;
      appStateSubscription?.remove();
      appResume.remove();
      unsubscribe();
      unsubscribeDeepLinks();
      seedSub.remove();
    };
  }, []);



  return (
    <AlertNotificationRoot theme='dark'>
      <SafeAreaProvider>
        <ThemeProvider>
          <ProfileProvider>
            <Routes />
          </ProfileProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </AlertNotificationRoot>
  )
}

export default App;
