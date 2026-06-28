import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Program from "../screens/Program";
import AddPill from "../screens/Pills/AddPill";
import EditPill from "../screens/Pills/EditPill";

const Stack = createNativeStackNavigator();

const ProgramNavigator = () => {
    return (
        <Stack.Navigator initialRouteName={"Program"} screenOptions={() => {
            return {
                headerShown: false,
                gestureEnabled: true,
                animation: 'slide_from_right',
            }
        }}>
            <Stack.Screen name={"Program"} component={Program}/>
        </Stack.Navigator>
    )
}

export default ProgramNavigator;