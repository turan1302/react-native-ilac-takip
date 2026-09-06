import React from 'react';
import { View, Text, Image } from 'react-native';
import { APP_NAME, APP_VERSION } from '../../../common/appInfo';
import { useTheme } from '../../../common/ThemeContext';
import appIcon from '../../../assets/branding/app-icon.png';
import styles from './styles';

const AppVersionCard = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Image source={appIcon} style={styles.iconImage} />
      <View style={styles.info}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Uygulama Versiyonu
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>v{APP_VERSION}</Text>
        <Text style={[styles.appName, { color: colors.textMuted }]}>{APP_NAME}</Text>
      </View>
    </View>
  );
};

export default AppVersionCard;
