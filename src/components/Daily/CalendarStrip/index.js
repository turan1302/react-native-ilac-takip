import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getMonthYearLabel } from '../../../common/dailyHelpers';
import styles, { COLORS } from './styles';

const CalendarStrip = ({
  selectedDate,
  weekDays,
  onSelectDay,
  onOpenCalendar,
}) => (
  <>
    <View style={styles.calendarHeader}>
      <Text style={styles.calendarMonth}>
        {getMonthYearLabel(selectedDate)}
      </Text>
      <TouchableOpacity
        style={styles.calendarLink}
        onPress={onOpenCalendar}
        activeOpacity={0.7}
      >
        <Feather name="calendar" size={14} color={COLORS.primary} />
        <Text style={styles.calendarLinkText}>Takvim</Text>
      </TouchableOpacity>
    </View>

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
            {day.active && <View style={styles.calendarDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </>
);

export default CalendarStrip;
