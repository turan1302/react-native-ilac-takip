import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';

const DoseActions = ({
  status = 'pending',
  takenAt,
  onTake,
  onSkip,
  onSnooze,
  compact = false,
}) => {
  if (status === 'taken') {
    return (
      <View style={styles.wrap}>
        <View style={styles.takenBadge}>
          <Text style={styles.takenBadgeText}>Alındı</Text>
        </View>
        {takenAt ? <Text style={styles.meta}>{takenAt}</Text> : null}
      </View>
    );
  }

  if (status === 'postponed') {
    return (
      <View style={styles.wrap}>
        <View style={styles.snoozeButton}>
          <Text style={styles.snoozeButtonText}>Ertelendi</Text>
        </View>
        <View style={[styles.actions, compact && styles.actionsCompact]}>
          <TouchableOpacity style={styles.takeButton} onPress={onTake} activeOpacity={0.85}>
            <Text style={styles.takeButtonText}>Aldım</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.85}>
            <Text style={styles.skipButtonText}>Almadım</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (status === 'skipped' || status === 'missed') {
    return (
      <View style={styles.wrap}>
        <View style={styles.skippedBadge}>
          <Text style={styles.skippedBadgeText}>Alınmadı</Text>
        </View>
        <TouchableOpacity onPress={onTake} activeOpacity={0.7}>
          <Text style={styles.link}>Şimdi al</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.actions, compact && styles.actionsCompact]}>
      <TouchableOpacity style={styles.takeButton} onPress={onTake} activeOpacity={0.85}>
        <Text style={styles.takeButtonText}>Aldım</Text>
      </TouchableOpacity>
      {onSnooze ? (
        <TouchableOpacity style={styles.snoozeButton} onPress={onSnooze} activeOpacity={0.85}>
          <Text style={styles.snoozeButtonText}>Ertele</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.85}>
        <Text style={styles.skipButtonText}>Almadım</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DoseActions;
