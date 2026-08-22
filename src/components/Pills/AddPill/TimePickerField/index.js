import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles, { COLORS } from './styles';

const TimePickerField = ({ time, onPress, label = 'Saat Belirle' }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity
      style={styles.timeBox}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.timeIconBox}>
        <Feather name="clock" size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.timeText}>{time}</Text>
      <Feather name="clock" size={18} color={COLORS.primary} />
    </TouchableOpacity>
  </View>
);

export default TimePickerField;
