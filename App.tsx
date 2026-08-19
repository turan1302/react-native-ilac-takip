import React, { useEffect } from 'react'
import { Alert, Platform } from 'react-native';
import Routes from "./src/routes";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AlertNotificationRoot } from "react-native-alert-notification";
import ImmersiveMode from "react-native-immersive-mode";
import {
  getPermissionAlertCopy,
  initializeNotifications,
  openBackgroundReminderSettings,
  openReminderPermissionSettings,
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
    const setupNotifications = async () => {
      try {
        const permissionResult = await initializeNotifications();
        const scheduleResult = await rescheduleAllReminders();

        if (!permissionResult.notificationsGranted) {
          const copy = getPermissionAlertCopy('notifications');
          Alert.alert(
            copy.title,
            copy.message,
            [
              { text: 'Sonra', style: 'cancel' },
              {
                text: 'Ayarlara Git',
                onPress: () => openReminderPermissionSettings(),
              },
            ],
          );
          return;
        }

        if (!permissionResult.alarmGranted) {
          const copy = getPermissionAlertCopy('background');
          Alert.alert(
            copy.title,
            copy.message,
            [
              { text: 'Sonra', style: 'cancel' },
              {
                text: 'Ayarlara Git',
                onPress: () => openBackgroundReminderSettings(),
              },
            ],
          );
        }

        if (scheduleResult.permissionDenied) {
          return;
        }
      } catch (error) {
        console.warn('Notification setup failed:', error);
      }
    };

    setupNotifications();
  }, []);



  return (
    <AlertNotificationRoot theme='dark'>
      <SafeAreaProvider>
        <Routes />
      </SafeAreaProvider>
    </AlertNotificationRoot>
  )
}

export default App;
