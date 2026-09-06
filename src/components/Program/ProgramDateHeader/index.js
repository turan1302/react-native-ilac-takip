import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { formatDateLabel } from '../../../common/pillHelpers';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const ProgramDateHeader = ({
  selectedDate,
  onOpenCalendar,
  onPreviousDay,
  onNextDay,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.programHeader}>
      <TouchableOpacity
        style={styles.programTitleWrap}
        onPress={onOpenCalendar}
        activeOpacity={0.7}
      >
        <Text style={[styles.programTitle, { color: colors.text }]}>Program</Text>
        <Text style={[styles.programSubtitle, { color: colors.textSecondary }]}>
          {formatDateLabel(selectedDate)}
        </Text>
      </TouchableOpacity>
      <View style={styles.programNav}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          activeOpacity={0.7}
          onPress={onPreviousDay}
        >
          <Feather name="chevron-left" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          activeOpacity={0.7}
          onPress={onOpenCalendar}
        >
          <Feather name="calendar" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          activeOpacity={0.7}
          onPress={onNextDay}
        >
          <Feather name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProgramDateHeader;
