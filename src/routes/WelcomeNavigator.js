import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AnimatedTabBar from '../components/shared/AnimatedTabBar';
import TabBarItem from '../components/shared/TabBarItem';
import ProgramNavigator from './ProgramNavigator';
import HomeNavigator from './HomeNavigator';
import DailyNavigator from "./DailyNavigator";
import SettingsNavigator from "./SettingsNavigator";

const Tab = createBottomTabNavigator();

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
      tabBar={props => <AnimatedTabBar {...props} />}
      screenOptions={({ route }) => {
        const tabConfig = TAB_CONFIG[route.name];

        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ focused }) => (
            <TabBarItem
              focused={focused}
              icon={tabConfig?.icon ?? 'circle'}
              label={tabConfig?.label ?? ''}
            />
          ),
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
