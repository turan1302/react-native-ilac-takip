import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const CalendarStrip = ({ weekDays, onSelectDay }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.calendarCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
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
                { color: colors.textSecondary },
                day.active && { color: colors.primary },
              ]}
            >
              {day.day}
            </Text>
            <View
              style={[
                styles.calendarDate,
                day.active && {
                  backgroundColor: colors.calendarActive,
                },
              ]}
            >
              <Text
                style={[
                  styles.calendarDateText,
                  { color: colors.text },
                  day.active && { color: colors.calendarActiveText },
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
};

export default CalendarStrip;
