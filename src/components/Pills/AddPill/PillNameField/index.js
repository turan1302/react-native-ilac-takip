import React from 'react';
import { View, Text, TextInput } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles, { COLORS } from './styles';

const PillNameField = ({ value, onChangeText }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>İlaç Adı</Text>
    <View style={styles.inputWithIcon}>
      <TextInput
        style={styles.inputInner}
        placeholder="Örn: Parol"
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
      />
      <MaterialCommunityIcons name="pill" size={20} color={COLORS.textMuted} />
    </View>
  </View>
);

export default PillNameField;
