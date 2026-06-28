import React from 'react';
import { View } from 'react-native';
import styles from './styles';

const PillLogo = () => (
  <View style={styles.iconWrapper}>
    <View style={styles.pill}>
      <View style={[styles.pillHalf, styles.pillHalfLeft]} />
      <View style={[styles.pillHalf, styles.pillHalfRight]} />
    </View>
  </View>
);

export default PillLogo;
