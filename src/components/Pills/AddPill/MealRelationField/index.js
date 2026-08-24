import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MEAL_RELATIONS } from '../../../../common/pillFormConstants';
import styles from '../ScheduleExtras/styles';

export const MealRelationField = ({ value, onChange }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>Yemekle ilişki</Text>
    <View style={styles.chipsWrap}>
      {MEAL_RELATIONS.map(item => {
        const active = (value || 'none') === item.value;

        return (
          <TouchableOpacity
            key={item.value}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(item.value)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);
