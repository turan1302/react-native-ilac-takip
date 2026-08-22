/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { handleNotificationAction } from './src/common/NotificationService';

notifee.onBackgroundEvent(async event => {
  if (event.type === EventType.ACTION_PRESS) {
    await handleNotificationAction(event);
  }
});

AppRegistry.registerComponent(appName, () => App);
