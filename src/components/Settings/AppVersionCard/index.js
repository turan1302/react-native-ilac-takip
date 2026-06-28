import React from 'react';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { APP_NAME, APP_VERSION } from '../../../common/appInfo';
import styles, { COLORS } from './styles';

const AppVersionCard = () => (
  <View style={styles.card}>
    <View style={styles.iconWrapper}>
      <MaterialCommunityIcons name="pill" size={22} color={COLORS.primary} />
    </View>
    <View style={styles.info}>
      <Text style={styles.label}>Uygulama Versiyonu</Text>
      <Text style={styles.value}>v{APP_VERSION}</Text>
      <Text style={styles.appName}>{APP_NAME}</Text>
    </View>
  </View>
);

export default AppVersionCard;
