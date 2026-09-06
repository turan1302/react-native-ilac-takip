import React, { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {
  getQuietHoursSettings,
  setQuietHoursEnabled,
  setQuietHoursRange,
} from '../../../common/QuietHoursStorage';
import { rescheduleAllReminders } from '../../../common/NotificationService';
import { useTheme } from '../../../common/ThemeContext';
import TimePickerModal from '../../Pills/AddPill/TimePickerModal';
import { parseTime } from '../../../common/pillFormConstants';
import styles from './styles';

const QuietHoursSection = () => {
  const { colors } = useTheme();
  const [enabled, setEnabled] = useState(true);
  const [start, setStart] = useState('23:00');
  const [end, setEnd] = useState('07:00');
  const [pickerTarget, setPickerTarget] = useState(null);
  const [tempHour, setTempHour] = useState('23');
  const [tempMinute, setTempMinute] = useState('00');

  const loadSettings = useCallback(async () => {
    const settings = await getQuietHoursSettings();
    setEnabled(settings.enabled);
    setStart(settings.start);
    setEnd(settings.end);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings]),
  );

  const persistAndReschedule = async next => {
    if (typeof next.enabled === 'boolean') {
      await setQuietHoursEnabled(next.enabled);
      setEnabled(next.enabled);
    }

    if (next.start || next.end) {
      const range = {
        start: next.start || start,
        end: next.end || end,
      };
      await setQuietHoursRange(range);
      setStart(range.start);
      setEnd(range.end);
    }

    await rescheduleAllReminders();
  };

  const openPicker = target => {
    const current = parseTime(target === 'start' ? start : end);
    setTempHour(current.hour);
    setTempMinute(current.minute);
    setPickerTarget(target);
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconWrapper, { backgroundColor: colors.primarySoft }]}>
          <Feather name="moon" size={18} color={colors.primary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: colors.text }]}>Sessiz saatler</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {enabled
              ? `${start} – ${end} arası bildirim yok, sabah toplu hatırlatma`
              : 'Kapalı: tüm saatlerde hatırlatma gelir'}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.switchTrack,
            { backgroundColor: enabled ? colors.primary : colors.border },
          ]}
          onPress={() => persistAndReschedule({ enabled: !enabled })}
          activeOpacity={0.8}
        >
          <View style={[styles.switchThumb, !enabled && styles.switchThumbOff]} />
        </TouchableOpacity>
      </View>

      {enabled ? (
        <View style={styles.timeRow}>
          <TouchableOpacity
            style={[
              styles.timeButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={() => openPicker('start')}
          >
            <Text style={[styles.timeCaption, { color: colors.textSecondary }]}>
              Başlangıç
            </Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>{start}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={() => openPicker('end')}
          >
            <Text style={[styles.timeCaption, { color: colors.textSecondary }]}>
              Bitiş / sabah
            </Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>{end}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TimePickerModal
        visible={Boolean(pickerTarget)}
        tempHour={tempHour}
        tempMinute={tempMinute}
        onClose={() => setPickerTarget(null)}
        onSelectHour={setTempHour}
        onSelectMinute={setTempMinute}
        onConfirm={() => {
          const value = `${tempHour}:${tempMinute}`;
          persistAndReschedule(
            pickerTarget === 'start' ? { start: value } : { end: value },
          );
          setPickerTarget(null);
        }}
      />
    </View>
  );
};

export default QuietHoursSection;
