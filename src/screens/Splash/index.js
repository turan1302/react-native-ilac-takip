import React, { useEffect } from 'react';
import { View, Text, StatusBar, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './styles';
import * as NavigationService from '../../common/NavigationService';

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
            <StatusBar barStyle="light-content" backgroundColor="#0D9488" />

            <View style={styles.content}>
                <View style={styles.iconWrapper}>
                    <View style={styles.pill}>
                        <View style={[styles.pillHalf, styles.pillHalfLeft]} />
                        <View style={[styles.pillHalf, styles.pillHalfRight]} />
                    </View>
                </View>

                <Text style={styles.title}>İlaç Takip</Text>
                <Text style={styles.subtitle}>
                    İlaçlarınızı kaydedin, dozajlarınızı ayarlayın ve zamanında alın.
                </Text>

                <View style={styles.footer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Splash;