import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getMonthYearLabel } from '../../../common/dailyHelpers';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const CalendarStrip = ({
  selectedDate,
  weekDays,
  onSelectDay,
  onOpenCalendar,
}) => {
  const { colors } = useTheme();

  return (
    <>
      <View style={styles.calendarHeader}>
        <Text style={[styles.calendarMonth, { color: colors.text }]}>
          {getMonthYearLabel(selectedDate)}
        </Text>
        <TouchableOpacity
          style={styles.calendarLink}
          onPress={onOpenCalendar}
          activeOpacity={0.7}
        >
          <Feather name="calendar" size={14} color={colors.primary} />
          <Text style={[styles.calendarLinkText, { color: colors.primary }]}>
            Takvim
          </Text>
        </TouchableOpacity>
      </View>

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
              {day.active && (
                <View
                  style={[styles.calendarDot, { backgroundColor: colors.primary }]}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
};

export default CalendarStrip;
