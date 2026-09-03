import React, { useCallback, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {
  getTravelShift,
  setTravelShift,
} from '../../../common/TravelShiftStorage';
import { rescheduleAllReminders } from '../../../common/NotificationService';
import { useProfile } from '../../../common/ProfileContext';
import { getTodayDateKey } from '../../../common/IntakeStorage';
import {
  buildDateKey,
  formatDateLabel,
  getDaysInMonth,
  getYearOptions,
  parseDateKeyParts,
  shiftDateKeyByDays,
} from '../../../common/pillHelpers';
import DatePickerModal from '../../Program/DatePickerModal';
import styles, { COLORS } from '../QuietHoursSection/styles';

const OFFSETS = [-2, -1, 0, 1, 2];

const offsetLabel = hours => {
  if (!hours) {
    return '0';
  }

  return hours > 0 ? `+${hours}` : `${hours}`;
};

const TravelShiftSection = () => {
  const { activeProfileId } = useProfile();
  const [offsetHours, setOffsetHours] = useState(0);
  const [dateKey, setDateKey] = useState(getTodayDateKey());
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [tempDay, setTempDay] = useState(1);
  const [tempMonth, setTempMonth] = useState(1);
  const [tempYear, setTempYear] = useState(new Date().getFullYear());

  const loadSettings = useCallback(async () => {
    const shift = await getTravelShift(activeProfileId);
    setOffsetHours(shift?.offsetHours || 0);
    setDateKey(shift?.dateKey || getTodayDateKey());
  }, [activeProfileId]);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings]),
  );

  const persist = async (nextHours, nextDate = dateKey) => {
    const hours = nextHours || 0;
    const day = nextDate || getTodayDateKey();
    setOffsetHours(hours);
    setDateKey(day);
    await setTravelShift(activeProfileId, {
      dateKey: day,
      offsetHours: hours,
    });
    await rescheduleAllReminders();
  };

  const openDateModal = () => {
    const { year, month, day } = parseDateKeyParts(dateKey || getTodayDateKey());
    setTempYear(year);
    setTempMonth(month);
    setTempDay(day);
    setDateModalVisible(true);
  };

  const daysInMonth = getDaysInMonth(tempYear, tempMonth);
  const dayOptions = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const yearOptions = getYearOptions(tempYear);
  const today = getTodayDateKey();
  const active = offsetHours !== 0;

  const subtitle = useMemo(() => {
    if (!active) {
      return 'Uçak, ramazan, yaz saati: seçilen gün tüm saatler kayar';
    }

    const sign = offsetHours > 0 ? '+' : '';
    return `${formatDateLabel(dateKey)} • ${sign}${offsetHours} saat`;
  }, [active, dateKey, offsetHours]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrapper}>
          <Feather name="sunrise" size={18} color={COLORS.primary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Tatil / seyahat saati</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={[styles.timeRow, { flexWrap: 'wrap' }]}>
        {OFFSETS.map(hours => (
          <TouchableOpacity
            key={hours}
            style={[
              styles.timeButton,
              offsetHours === hours && { borderColor: COLORS.primary },
            ]}
            onPress={() => persist(hours, dateKey || today)}
          >
            <Text style={styles.timeCaption}>Saat</Text>
            <Text style={styles.timeValue}>{offsetLabel(hours)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.timeRow}>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => persist(offsetHours, today)}
        >
          <Text style={styles.timeCaption}>Gün</Text>
          <Text style={styles.timeValue}>Bugün</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => persist(offsetHours, shiftDateKeyByDays(today, 1))}
        >
          <Text style={styles.timeCaption}>Gün</Text>
          <Text style={styles.timeValue}>Yarın</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.timeButton} onPress={openDateModal}>
          <Text style={styles.timeCaption}>Tarih</Text>
          <Text style={styles.timeValue} numberOfLines={1}>
            {dateKey === today ? 'Bugün' : dateKey.slice(5)}
          </Text>
        </TouchableOpacity>
      </View>

      <DatePickerModal
        visible={dateModalVisible}
        dayOptions={dayOptions}
        yearOptions={yearOptions}
        tempDay={tempDay}
        tempMonth={tempMonth}
        tempYear={tempYear}
        onClose={() => setDateModalVisible(false)}
        onSelectDay={setTempDay}
        onSelectMonth={setTempMonth}
        onSelectYear={setTempYear}
        onGoToToday={() => {
          const now = new Date();
          setTempYear(now.getFullYear());
          setTempMonth(now.getMonth() + 1);
          setTempDay(now.getDate());
        }}
        onConfirm={() => {
          const next = buildDateKey({
            year: tempYear,
            month: tempMonth,
            day: tempDay,
          });
          persist(offsetHours, next);
          setDateModalVisible(false);
        }}
      />
    </View>
  );
};

export default TravelShiftSection;
