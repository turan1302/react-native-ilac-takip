import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef } from '../common/NavigationService';
import { useTheme } from '../common/ThemeContext';
import Splash from "../screens/Splash";
import OnBoard from "../screens/OnBoard";
import NextDose from "../screens/NextDose";
import WelcomeNavigator from "./WelcomeNavigator";
import AddPill from "../screens/Pills/AddPill";
import EditPill from "../screens/Pills/EditPill";
import Notifications from "../screens/Notifications";


const Stack = createNativeStackNavigator();

const Routes = () => {
    const { isDark, colors } = useTheme();
    const navTheme = {
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
            ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
            background: colors.background,
            card: colors.card,
            text: colors.text,
            border: colors.border,
            primary: colors.primary,
        },
    };

    return (
        <NavigationContainer ref={navigationRef} theme={navTheme}>
            <Stack.Navigator
                id={'1'}
                initialRouteName={'Splash'}
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen
                    name={'Splash'}
                    component={Splash}
                    options={{ gestureEnabled: false, animation: 'fade' }}
                />
                <Stack.Screen name={'OnBoard'} component={OnBoard} />
                <Stack.Screen
                    name={'NextDose'}
                    component={NextDose}
                    options={{ gestureEnabled: false, animation: 'fade' }}
                />
                <Stack.Screen name={"AddPill"} component={AddPill} />
                <Stack.Screen name={"EditPill"} component={EditPill} />
                <Stack.Screen name={"Notifications"} component={Notifications} />
                <Stack.Screen name={'WelcomeNavigator'} component={WelcomeNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Routes;