import React from 'react';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import NotificationBell from '../../NotificationBell';
import ProfileSwitcher from '../../shared/ProfileSwitcher';
import styles from './styles';

const Header = () => (
  <View style={styles.header}>
    <View style={styles.headerTitleRow}>
      <View style={styles.headerPillIcon}>
        <MaterialCommunityIcons name="pill" size={16} color="#FFFFFF" />
      </View>
      <Text style={styles.headerTitle}>
        <Text style={styles.headerTitleAccent}>İlaç </Text>
        Takibi
      </Text>
    </View>
    <View style={styles.headerActions}>
      <ProfileSwitcher />
      <NotificationBell buttonStyle={styles.notificationButton} />
    </View>
  </View>
);

export default Header;
