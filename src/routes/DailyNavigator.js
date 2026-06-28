import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Daily from '../screens/Daily';
import EditPill from '../screens/Pills/EditPill';

const Stack = createNativeStackNavigator();

const DailyNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Daily"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Daily" component={Daily} />
    </Stack.Navigator>
  );
};

export default DailyNavigator;
