import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getTodayDateKey } from '../../../../common/IntakeStorage';
import {
  formatDateLabel,
  shiftDateKeyByDays,
} from '../../../../common/pillHelpers';
import { isPillPausedOnDate } from '../../../../common/scheduleAdjustments';
import styles from '../ScheduleExtras/styles';

const PRESETS = [
  { days: 1, label: '1 gün' },
  { days: 3, label: '3 gün' },
  { days: 7, label: '7 gün' },
];

const PauseField = ({ pauseStart, pauseUntil, onChange }) => {
  const today = getTodayDateKey();
  const paused = isPillPausedOnDate(
    { pauseStart, pauseUntil },
    today,
  );

  const applyDays = days => {
    onChange({
      pauseStart: today,
      pauseUntil: shiftDateKeyByDays(today, days - 1),
    });
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>İlaç molası</Text>
      <Text style={[styles.dateCaption, { marginBottom: 8 }]}>
        {paused
          ? `${formatDateLabel(pauseStart || today)} – ${formatDateLabel(
              pauseUntil,
            )} arası hatırlatma yok`
          : 'Antibiyotik bitti / doktor kesti: hatırlatmalar durur'}
      </Text>
      <View style={styles.chipsWrap}>
        {PRESETS.map(item => (
          <TouchableOpacity
            key={item.days}
            style={styles.chip}
            onPress={() => applyDays(item.days)}
          >
            <Text style={styles.chipText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.chip, !paused && styles.chipActive]}
          onPress={() => onChange({ pauseStart: '', pauseUntil: '' })}
        >
          <Text style={[styles.chipText, !paused && styles.chipTextActive]}>
            Molayı bitir
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PauseField;
