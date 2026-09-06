import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getMissedAdviceText } from '../../../common/scheduleAdjustments';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const NudgeCard = ({ snapshot, onTake }) => {
  const { colors, isDark } = useTheme();

  if (!snapshot || snapshot.kind === 'empty' || snapshot.kind === 'done') {
    return null;
  }

  const overdue = snapshot.kind === 'overdue';
  const missedAdvice = overdue
    ? getMissedAdviceText(snapshot.items?.[0]?.pill)
    : '';
  const accent = overdue ? colors.warning : colors.success;

  return (
    <View
      style={[
        styles.card,
        overdue ? styles.cardOverdue : styles.cardUpcoming,
        isDark && {
          backgroundColor: overdue ? '#451A03' : '#064E3B',
          borderColor: accent,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          overdue ? styles.iconOverdue : styles.iconUpcoming,
          isDark && { backgroundColor: colors.card },
        ]}
      >
        <Feather
          name={overdue ? 'bell' : 'clock'}
          size={18}
          color={accent}
        />
      </View>
      <View style={styles.textWrap}>
        <Text
          style={[
            styles.kicker,
            overdue ? styles.kickerOverdue : styles.kickerUpcoming,
            isDark && { color: accent },
          ]}
        >
          {snapshot.kicker}
        </Text>
        <Text style={[styles.title, { color: isDark ? colors.text : undefined }]}>
          {snapshot.headline}
        </Text>
        <Text
          style={[
            styles.subtitle,
            isDark && { color: colors.textSecondary },
          ]}
        >
          {snapshot.subtitle}
        </Text>
        {missedAdvice ? (
          <Text
            style={[
              styles.subtitle,
              isDark && { color: colors.textSecondary },
            ]}
          >
            {missedAdvice}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={[styles.takeButton, { backgroundColor: colors.primary }]}
        onPress={onTake}
        activeOpacity={0.85}
      >
        <Text style={styles.takeButtonText}>Aldım</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NudgeCard;
