import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const DoseActions = ({
  status = 'pending',
  takenAt,
  onTake,
  onSkip,
  onSnooze,
  compact = false,
}) => {
  const { colors, isDark } = useTheme();

  if (status === 'taken') {
    return (
      <View style={styles.wrap}>
        <View
          style={[
            styles.takenBadge,
            { backgroundColor: colors.takenBadgeBg },
          ]}
        >
          <Text style={[styles.takenBadgeText, { color: colors.takenBadgeText }]}>
            Alındı
          </Text>
        </View>
        {takenAt ? (
          <Text style={[styles.meta, { color: colors.textMuted }]}>{takenAt}</Text>
        ) : null}
      </View>
    );
  }

  if (status === 'postponed') {
    return (
      <View style={styles.wrap}>
        <View
          style={[
            styles.snoozeButton,
            isDark && { backgroundColor: '#78350F' },
          ]}
        >
          <Text
            style={[styles.snoozeButtonText, isDark && { color: colors.warning }]}
          >
            Ertelendi
          </Text>
        </View>
        <View style={[styles.actions, compact && styles.actionsCompact]}>
          <TouchableOpacity
            style={[styles.takeButton, { backgroundColor: colors.primary }]}
            onPress={onTake}
            activeOpacity={0.85}
          >
            <Text style={styles.takeButtonText}>Aldım</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.skipButton,
              { backgroundColor: colors.skippedBadgeBg },
            ]}
            onPress={onSkip}
            activeOpacity={0.85}
          >
            <Text
              style={[styles.skipButtonText, { color: colors.skippedBadgeText }]}
            >
              Almadım
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (status === 'skipped' || status === 'missed') {
    return (
      <View style={styles.wrap}>
        <View
          style={[
            styles.skippedBadge,
            { backgroundColor: colors.skippedBadgeBg },
          ]}
        >
          <Text
            style={[styles.skippedBadgeText, { color: colors.skippedBadgeText }]}
          >
            Alınmadı
          </Text>
        </View>
        <TouchableOpacity onPress={onTake} activeOpacity={0.7}>
          <Text style={[styles.link, { color: colors.primary }]}>Şimdi al</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.actions, compact && styles.actionsCompact]}>
      <TouchableOpacity
        style={[styles.takeButton, { backgroundColor: colors.primary }]}
        onPress={onTake}
        activeOpacity={0.85}
      >
        <Text style={styles.takeButtonText}>Aldım</Text>
      </TouchableOpacity>
      {onSnooze ? (
        <TouchableOpacity
          style={[
            styles.snoozeButton,
            isDark && { backgroundColor: '#78350F' },
          ]}
          onPress={onSnooze}
          activeOpacity={0.85}
        >
          <Text
            style={[styles.snoozeButtonText, isDark && { color: colors.warning }]}
          >
            Ertele
          </Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        style={[
          styles.skipButton,
          { backgroundColor: colors.skippedBadgeBg },
        ]}
        onPress={onSkip}
        activeOpacity={0.85}
      >
        <Text
          style={[styles.skipButtonText, { color: colors.skippedBadgeText }]}
        >
          Almadım
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DoseActions;
