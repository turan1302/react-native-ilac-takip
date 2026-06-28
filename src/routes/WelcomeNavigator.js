import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { View, Platform, Text } from 'react-native';
import ProgramNavigator from './ProgramNavigator';
import HomeNavigator from './HomeNavigator';
import DailyNavigator from "./DailyNavigator";
import SettingsNavigator from "./SettingsNavigator";

const Tab = createBottomTabNavigator();

const TAB_COLOR_ACTIVE = '#0D9488';
const TAB_COLOR_INACTIVE = '#9CA3AF';
const TAB_BG_ACTIVE = '#CCFBF1';

const TAB_CONFIG = {
  HomeNavigator: { label: 'Anasayfa', icon: 'home' },
  ProgramNavigator: { label: 'Program', icon: 'calendar' },
  DailyNavigator : {label : 'Günlük',icon : 'check-circle'},
  SettingsNavigator: { label: 'Ayarlar', icon: 'settings' },
};

const WelcomeNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeNavigator"
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? route.name;
        const tabBarHidden = ['AddPill', 'EditPill', 'LegalDocument'];
        const tabConfig = TAB_CONFIG[route.name];

        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: TAB_COLOR_ACTIVE,
          tabBarInactiveTintColor: TAB_COLOR_INACTIVE,
          tabBarLabel: ({ focused, color }) =>
            focused ? null : (
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: 11,
                  color,
                  marginTop: 2,
                }}
              >
                {tabConfig?.label}
              </Text>
            ),
          tabBarIcon: ({ focused }) => {
            const iconName = tabConfig?.icon ?? 'circle';
            const color = focused ? TAB_COLOR_ACTIVE : TAB_COLOR_INACTIVE;

            if (focused) {
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: TAB_BG_ACTIVE,
                    borderRadius: 20,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    gap: 6,
                  }}
                >
                  <Feather name={iconName} size={18} color={color} />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color,
                    }}
                  >
                    {tabConfig?.label}
                  </Text>
                </View>
              );
            }

            return <Feather name={iconName} size={22} color={color} />;
          },
          tabBarStyle: tabBarHidden.includes(routeName)
            ? { display: 'none' }
            : {
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E7EB',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderWidth: 1,
                height: Platform.OS === 'ios' ? 88 : 72,
                paddingTop: 8,
                paddingBottom: Platform.OS === 'ios' ? 28 : 10,
                paddingHorizontal: 8,
                elevation: 0,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
              },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        };
      }}
    >
      <Tab.Screen name="HomeNavigator" component={HomeNavigator} />
      <Tab.Screen name="ProgramNavigator" component={ProgramNavigator} />
      <Tab.Screen name="DailyNavigator" component={DailyNavigator}/>
      <Tab.Screen name="SettingsNavigator" component={SettingsNavigator}/>
    </Tab.Navigator>
  );
};

export default WelcomeNavigator;
