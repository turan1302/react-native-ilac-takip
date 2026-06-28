import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';

const CalendarStrip = ({ weekDays, onSelectDay }) => (
  <View style={styles.calendarCard}>
    <View style={styles.calendarRow}>
      {weekDays.map(day => (
        <TouchableOpacity
          key={day.key}
          style={styles.calendarDay}
          onPress={() => onSelectDay(day.dateKey)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.calendarDayLabel,
              day.active && styles.calendarDayLabelActive,
            ]}
          >
            {day.day}
          </Text>
          <View
            style={[
              styles.calendarDate,
              day.active && styles.calendarDateActive,
            ]}
          >
            <Text
              style={[
                styles.calendarDateText,
                day.active && styles.calendarDateTextActive,
              ]}
            >
              {day.date}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default CalendarStrip;
