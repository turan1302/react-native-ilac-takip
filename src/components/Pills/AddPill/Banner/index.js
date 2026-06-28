import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const Banner = ({
  text = 'Yeni bir tedavi planı oluşturun.',
}) => (
  <View style={styles.banner}>
    <View style={styles.bannerImage} />
    <View style={styles.bannerDecor} />
    <View style={styles.bannerDecorSmall} />
    <View style={styles.bannerOverlay}>
      <Text style={styles.bannerText}>{text}</Text>
    </View>
  </View>
);

export default Banner;
