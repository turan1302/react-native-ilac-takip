import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FREQUENCIES } from '../../../../common/pillFormConstants';
import styles from './styles';

const FrequencyChips = ({ value, onChange }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>Sıklık</Text>
    <View style={styles.chipsWrap}>
      {FREQUENCIES.map(item => {
        const isActive = value === item;

        return (
          <TouchableOpacity
            key={item}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onChange(item)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

export default FrequencyChips;
