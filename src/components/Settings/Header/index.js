import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Ayarlar</Text>
    <Text style={styles.headerSubtitle}>
      Uygulama tercihlerinizi buradan yönetin.
    </Text>
  </View>
);

export default Header;
