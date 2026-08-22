import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationService from '../../common/NavigationService';
import { migrateAppStorage } from '../../common/storage/migrateStorage';
import { ONBOARD_SHOW_KEY } from '../../common/storage/keys';
import LoadingFooter from '../../components/Splash/LoadingFooter';
import PillLogo from '../../components/Splash/PillLogo';
import SplashIntro from '../../components/Splash/SplashIntro';
import styles, { COLORS } from './styles';

const Splash = () => {
  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      await Promise.all([
        migrateAppStorage(),
        new Promise(resolve => setTimeout(resolve, 2000)),
      ]);

      if (cancelled) {
        return;
      }

      const onboardShow = await AsyncStorage.getItem(ONBOARD_SHOW_KEY);

      if (onboardShow === 'true') {
        NavigationService.reset();
      } else {
        NavigationService.replace('OnBoard');
      }
    };

    boot();

    return () => {
      cancelled = true;
    };
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
