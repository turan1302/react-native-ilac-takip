import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { formatDateLabel } from '../../../common/pillHelpers';
import styles, { COLORS } from './styles';

const ProgramDateHeader = ({
  selectedDate,
  onOpenCalendar,
  onPreviousDay,
  onNextDay,
}) => (
  <View style={styles.programHeader}>
    <TouchableOpacity
      style={styles.programTitleWrap}
      onPress={onOpenCalendar}
      activeOpacity={0.7}
    >
      <Text style={styles.programTitle}>Program</Text>
      <Text style={styles.programSubtitle}>
        {formatDateLabel(selectedDate)}
      </Text>
    </TouchableOpacity>
    <View style={styles.programNav}>
      <TouchableOpacity
        style={styles.navButton}
        activeOpacity={0.7}
        onPress={onPreviousDay}
      >
        <Feather name="chevron-left" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        activeOpacity={0.7}
        onPress={onOpenCalendar}
      >
        <Feather name="calendar" size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        activeOpacity={0.7}
        onPress={onNextDay}
      >
        <Feather name="chevron-right" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  </View>
);

export default ProgramDateHeader;
