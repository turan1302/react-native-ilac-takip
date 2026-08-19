import React, { useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef } from '../common/NavigationService';
import Splash from "../screens/Splash";
import OnBoard from "../screens/OnBoard";
import WelcomeNavigator from "./WelcomeNavigator";
import AddPill from "../screens/Pills/AddPill";
import EditPill from "../screens/Pills/EditPill";
import Notifications from "../screens/Notifications";


const Stack = createNativeStackNavigator();

const Routes = () => {

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                id={'1'}
                initialRouteName={'Splash'}
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen
                    name={'Splash'}
                    component={Splash}
                    options={{ gestureEnabled: false, animation: 'fade' }}
                />
                <Stack.Screen name={'OnBoard'} component={OnBoard} />
                <Stack.Screen name={"AddPill"} component={AddPill} />
                <Stack.Screen name={"EditPill"} component={EditPill} />
                <Stack.Screen name={"Notifications"} component={Notifications} />
                <Stack.Screen name={'WelcomeNavigator'} component={WelcomeNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Routes;