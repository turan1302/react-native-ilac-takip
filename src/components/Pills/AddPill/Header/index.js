import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles, { COLORS } from './styles';

const Header = ({ onCancel }) => (
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.headerButton}
      onPress={onCancel}
      activeOpacity={0.7}
    >
      <Feather name="arrow-left" size={24} color={COLORS.primary} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>İlaç Ekle</Text>
    <View style={styles.headerButton}>
      <MaterialCommunityIcons name="pill" size={22} color={COLORS.primary} />
    </View>
  </View>
);

export default Header;
