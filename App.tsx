import React, { useEffect } from 'react'
import { AppState, Platform } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import Routes from "./src/routes";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AlertNotificationRoot } from "react-native-alert-notification";
import ImmersiveMode from "react-native-immersive-mode";
import { ProfileProvider } from './src/common/ProfileContext';
import {
    handleNotificationAction,
    initializeNotifications,
    rescheduleAllReminders,
} from './src/common/NotificationService';

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
        if (cancelled || !permissionResult.notificationsGranted) {
          return;
        }

        await rescheduleAllReminders();
      } catch (error) {
        console.warn('Notification setup failed:', error);
      }
    };

    setupNotifications();

    const unsubscribe = notifee.onForegroundEvent(event => {
      if (event.type === EventType.ACTION_PRESS) {
        handleNotificationAction(event);
      }
    });

    return () => {
      cancelled = true;
      appStateSubscription?.remove();
      unsubscribe();
    };
  }, []);



  return (
    <AlertNotificationRoot theme='dark'>
      <SafeAreaProvider>
        <ProfileProvider>
          <Routes />
        </ProfileProvider>
      </SafeAreaProvider>
    </AlertNotificationRoot>
  )
}

export default App;
