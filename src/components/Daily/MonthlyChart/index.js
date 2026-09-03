import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';

const barColor = day => {
  if (day.total === 0 || day.compliance == null) {
    return '#E5E7EB';
  }

  if (day.compliance >= 90) {
    return '#059669';
  }

  if (day.compliance >= 70) {
    return '#10B981';
  }

  if (day.compliance >= 40) {
    return '#F59E0B';
  }

  return '#EF4444';
};

const MonthlyChart = ({ days = [], compliance = 0, selectedDate, onSelectDay }) => {
  if (!days.length) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>SON 30 GÜN</Text>
        <Text style={styles.value}>%{compliance}</Text>
      </View>
      <View style={styles.bars}>
        {days.map(day => {
          const height = Math.max(
            4,
            Math.round(((day.compliance || 0) / 100) * 36),
          );
          const selected = day.dateKey === selectedDate;

          return (
            <TouchableOpacity
              key={day.dateKey}
              style={styles.barHit}
              onPress={() => onSelectDay?.(day.dateKey)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor: barColor(day),
                    opacity: selected ? 1 : 0.85,
                  },
                  selected && styles.barSelected,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.caption}>
        Her çubuk bir gün. Dokunarak o güne gidin.
      </Text>
    </View>
  );
};

export default MonthlyChart;
