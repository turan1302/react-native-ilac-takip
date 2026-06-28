import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Settings from '../screens/Settings';
import LegalDocument from '../screens/Settings/LegalDocument';

const Stack = createNativeStackNavigator();

const SettingsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Settings"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="LegalDocument" component={LegalDocument} />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
