import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles, { COLORS } from './styles';

const Header = ({ onGoBack }) => (
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.headerButton}
      onPress={onGoBack}
      activeOpacity={0.7}
    >
      <Feather name="arrow-left" size={24} color={COLORS.primary} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Bildirimler</Text>
    <View style={styles.headerButton} />
  </View>
);

export default Header;
