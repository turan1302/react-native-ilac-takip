import React from 'react';
import { View, Text, Image } from 'react-native';
import { APP_NAME, APP_VERSION } from '../../../common/appInfo';
import appIcon from '../../../assets/branding/app-icon.png';
import styles from './styles';

const AppVersionCard = () => (
  <View style={styles.card}>
    <Image source={appIcon} style={styles.iconImage} />
    <View style={styles.info}>
      <Text style={styles.label}>Uygulama Versiyonu</Text>
      <Text style={styles.value}>v{APP_VERSION}</Text>
      <Text style={styles.appName}>{APP_NAME}</Text>
    </View>
  </View>
);

export default AppVersionCard;
