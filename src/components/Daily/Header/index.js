import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ProfileSwitcher from '../../shared/ProfileSwitcher';
import styles, { COLORS } from './styles';

const Header = ({ searchVisible, onToggleSearch, onShareWeekly }) => (
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
      {onShareWeekly ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onShareWeekly}
          activeOpacity={0.7}
        >
          <Feather name="share-2" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        style={[styles.iconButton, searchVisible && styles.iconButtonActive]}
        onPress={onToggleSearch}
        activeOpacity={0.7}
      >
        <Feather
          name={searchVisible ? 'x' : 'search'}
          size={20}
          color={searchVisible ? COLORS.primary : COLORS.textSecondary}
        />
      </TouchableOpacity>
    </View>
  </View>
);

export default Header;
