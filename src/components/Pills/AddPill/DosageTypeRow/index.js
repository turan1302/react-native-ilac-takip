import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles, { COLORS } from './styles';

const DosageTypeRow = ({ dosage, type, onDosageChange, onOpenTypePicker }) => (
  <View style={[styles.row, styles.fieldGroup]}>
    <View style={styles.rowItem}>
      <Text style={styles.label}>Dozaj</Text>
      <TextInput
        style={styles.input}
        placeholder="500 mg"
        placeholderTextColor={COLORS.textMuted}
        value={dosage}
        onChangeText={onDosageChange}
      />
    </View>
    <View style={styles.rowItem}>
      <Text style={styles.label}>Tür</Text>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={onOpenTypePicker}
        activeOpacity={0.7}
      >
        <Text style={styles.selectText}>{type}</Text>
        <Feather name="chevron-down" size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  </View>
);

export default DosageTypeRow;
