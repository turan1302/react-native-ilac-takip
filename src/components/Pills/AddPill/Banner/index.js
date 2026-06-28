import React from 'react';
import { View, Text, Image } from 'react-native';
import { PILL_FORM_BANNER_IMAGE } from '../../../../datas/bannerImages';
import styles from './styles';

const Banner = ({
  text = 'Yeni bir tedavi planı oluşturun.',
}) => (
  <View style={styles.banner}>
    <Image
      source={{ uri: PILL_FORM_BANNER_IMAGE }}
      style={styles.bannerImage}
      resizeMode="cover"
    />
    <View style={styles.bannerOverlay}>
      <Text style={styles.bannerText}>{text}</Text>
    </View>
  </View>
);

export default Banner;
