import React, { useEffect } from 'react'
import { Alert } from 'react-native';
import Routes from "./src/routes";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AlertNotificationRoot, Toast } from "react-native-alert-notification";
import ImmersiveMode from "react-native-immersive-mode";
import {
  initializeNotifications,
  openBackgroundReminderSettings,
  rescheduleAllReminders,
} from './src/common/NotificationService';

const App = () => {

  useEffect(() => {
    ImmersiveMode.setBarMode("FullSticky");
    ImmersiveMode.setBarTranslucent(true);
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const permissionResult = await initializeNotifications();
        const scheduleResult = await rescheduleAllReminders();

        if (!permissionResult.notificationsGranted) {
          Alert.alert(
            'Bildirim İzni Gerekli',
            'İlaç hatırlatmaları için bildirim iznine ihtiyacımız var. Lütfen izin verin.',
            [
              { text: 'Sonra', style: 'cancel' },
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
            'Uygulama kapalıyken bildirim almak için izinleri açmanız gerekir. Listede görünmüyorsa önce bir ilaç ekleyin, ardından açılan ayarlardan pil ve otomatik başlatma izinlerini verin.',
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