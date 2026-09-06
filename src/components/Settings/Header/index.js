import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const Header = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Ayarlar</Text>
      <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
      Uygulama tercihlerinizi buradan yönetin
    </Text>
    </View>
  );
};

export default Header;
