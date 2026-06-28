import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles, { COLORS } from './styles';

const Header = ({ searchVisible, onToggleSearch }) => (
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
);

export default Header;
