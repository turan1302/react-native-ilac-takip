import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { MISSED_ADVICE_OPTIONS } from '../../../../common/scheduleAdjustments';
import styles, { COLORS } from '../ScheduleExtras/styles';

const MissedAdviceField = ({ value, note, onChange, onChangeNote, onFocus }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>Kaçırınca ne yapayım</Text>
    <View style={styles.chipsWrap}>
      {MISSED_ADVICE_OPTIONS.map(item => {
        const active = value === item.value;

        return (
          <TouchableOpacity
            key={item.value}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(active ? '' : item.value)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
    <TextInput
      style={[styles.notesInput, { minHeight: 72, marginTop: 10 }]}
      placeholder="İsteğe bağlı cümle: Şimdi al, çift alma..."
      placeholderTextColor={COLORS.textMuted}
      value={note}
      onChangeText={onChangeNote}
      onFocus={onFocus}
      multiline
    />
  </View>
);

export default MissedAdviceField;
