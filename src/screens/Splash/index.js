import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationService from '../../common/NavigationService';
import LoadingFooter from '../../components/Splash/LoadingFooter';
import PillLogo from '../../components/Splash/PillLogo';
import SplashIntro from '../../components/Splash/SplashIntro';
import styles, { COLORS } from './styles';

const ONBOARD_SHOW_KEY = 'onboard_show';

const Splash = () => {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const onboardShow = await AsyncStorage.getItem(ONBOARD_SHOW_KEY);

      if (onboardShow === 'true') {
        NavigationService.reset();
      } else {
        NavigationService.replace('OnBoard');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.content}>
        <PillLogo />
        <SplashIntro />
        <LoadingFooter />
      </View>
    </SafeAreaView>
  );
};

export default Splash;
