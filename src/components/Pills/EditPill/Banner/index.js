import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const Banner = () => (
  <View style={styles.banner}>
    <View style={styles.bannerImage} />
    <View style={styles.bannerDecor} />
    <View style={styles.bannerDecorSmall} />
    <View style={styles.bannerOverlay}>
      <Text style={styles.bannerText}>İlaç bilgilerinizi güncelleyin.</Text>
    </View>
  </View>
);

export default Banner;
