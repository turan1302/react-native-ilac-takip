/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { handleNotificationAction, rescheduleAllReminders } from './src/common/NotificationService';

notifee.onBackgroundEvent(async event => {
  if (event.type === EventType.ACTION_PRESS) {
    await handleNotificationAction(event);
  }

  if (event.type === EventType.DELIVERED) {
    await rescheduleAllReminders();
  }
});

AppRegistry.registerComponent(appName, () => App);
