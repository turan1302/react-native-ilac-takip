import React from 'react';
import { View, Text, TextInput } from 'react-native';
import styles, { COLORS } from './styles';

const NotesField = ({ value, onChangeText, onFocus }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>Notlar (Opsiyonel)</Text>
    <TextInput
      style={styles.notesInput}
      placeholder="Aç karnına içilmelidir..."
      placeholderTextColor={COLORS.textMuted}
      value={value}
      onChangeText={onChangeText}
      onFocus={onFocus}
      multiline
    />
  </View>
);

export default NotesField;
