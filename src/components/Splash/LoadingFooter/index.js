import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import styles, { COLORS } from './styles';

const LoadingFooter = ({ text = 'Yükleniyor...' }) => (
  <View style={styles.footer}>
    <ActivityIndicator size="small" color={COLORS.white} />
    <Text style={styles.loadingText}>{text}</Text>
  </View>
);

export default LoadingFooter;
