import React from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles, { COLORS } from './styles';

const LoadingState = () => (
  <SafeAreaView style={styles.container}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </SafeAreaView>
);

export default LoadingState;
