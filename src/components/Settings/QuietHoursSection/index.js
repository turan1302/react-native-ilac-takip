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
import TimePickerModal from '../../Pills/AddPill/TimePickerModal';
import { parseTime } from '../../../common/pillFormConstants';
import styles, { COLORS } from './styles';

const QuietHoursSection = () => {
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
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrapper}>
          <Feather name="moon" size={18} color={COLORS.primary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Sessiz saatler</Text>
          <Text style={styles.subtitle}>
            {enabled
              ? `${start} – ${end} arası bildirim yok, sabah toplu hatırlatma`
              : 'Kapalı: tüm saatlerde hatırlatma gelir'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.switchTrack, !enabled && styles.switchTrackOff]}
          onPress={() => persistAndReschedule({ enabled: !enabled })}
          activeOpacity={0.8}
        >
          <View style={[styles.switchThumb, !enabled && styles.switchThumbOff]} />
        </TouchableOpacity>
      </View>

      {enabled ? (
        <View style={styles.timeRow}>
          <TouchableOpacity style={styles.timeButton} onPress={() => openPicker('start')}>
            <Text style={styles.timeCaption}>Başlangıç</Text>
            <Text style={styles.timeValue}>{start}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.timeButton} onPress={() => openPicker('end')}>
            <Text style={styles.timeCaption}>Bitiş / sabah</Text>
            <Text style={styles.timeValue}>{end}</Text>
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
