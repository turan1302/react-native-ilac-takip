import React from 'react';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../common/ThemeContext';
import NotificationBell from '../../NotificationBell';
import ProfileSwitcher from '../../shared/ProfileSwitcher';
import styles from './styles';

const Header = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <View
          style={[styles.headerPillIcon, { backgroundColor: colors.primary }]}
        >
          <MaterialCommunityIcons name="pill" size={16} color="#FFFFFF" />
        </View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          <Text style={[styles.headerTitleAccent, { color: colors.primary }]}>
            İlaç{' '}
          </Text>
          Takibi
        </Text>
      </View>

      <View style={styles.headerActions}>
        <ProfileSwitcher />
        <NotificationBell />
      </View>
    </View>
  );
};

export default Header;
