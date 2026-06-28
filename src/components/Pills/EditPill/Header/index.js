import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles, { COLORS } from './styles';

const Header = ({ onCancel, onDelete, disabled }) => (
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.headerButton}
      onPress={onCancel}
      activeOpacity={0.7}
    >
      <Feather name="arrow-left" size={24} color={COLORS.primary} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>İlaç Düzenle</Text>
    <TouchableOpacity
      style={styles.headerButton}
      onPress={onDelete}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Feather name="trash-2" size={22} color={COLORS.danger} />
    </TouchableOpacity>
  </View>
);

export default Header;
