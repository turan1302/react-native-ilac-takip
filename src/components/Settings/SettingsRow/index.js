import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles, { COLORS } from './styles';

const SettingsRow = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.iconWrapper}>
      <Feather name={icon} size={18} color={COLORS.primary} />
    </View>
    <View style={styles.content}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    <Feather name="chevron-right" size={18} color={COLORS.textSecondary} />
  </TouchableOpacity>
);

export default SettingsRow;
