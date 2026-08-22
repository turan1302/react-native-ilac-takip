import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import {
  MONTH_DAYS,
  WEEKDAYS,
  needsDateRange,
  needsMonthDayPicker,
  needsWeekdayPicker,
} from '../../../../common/pillFormConstants';
import styles, { COLORS } from './styles';

const ScheduleExtras = ({
  frequency,
  daysOfWeek,
  daysOfMonth,
  startDate,
  endDate,
  onToggleWeekday,
  onToggleMonthDay,
  onOpenStartDate,
  onOpenEndDate,
}) => {
  if (needsWeekdayPicker(frequency)) {
    return (
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Haftanın günleri</Text>
        <View style={styles.chipsWrap}>
          {WEEKDAYS.map(day => {
            const active = daysOfWeek.includes(day.value);

            return (
              <TouchableOpacity
                key={day.value}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onToggleWeekday(day.value)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  if (needsMonthDayPicker(frequency)) {
    return (
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Ayın günleri</Text>
        <View style={styles.chipsWrap}>
          {MONTH_DAYS.map(day => {
            const active = daysOfMonth.includes(day);

            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayChip, active && styles.chipActive]}
                onPress={() => onToggleMonthDay(day)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  if (needsDateRange(frequency)) {
    return (
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Tarih aralığı</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateButton} onPress={onOpenStartDate}>
            <Text style={styles.dateCaption}>Başlangıç</Text>
            <Text style={styles.dateValue}>{startDate || 'Seçin'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateButton} onPress={onOpenEndDate}>
            <Text style={styles.dateCaption}>Bitiş</Text>
            <Text style={styles.dateValue}>{endDate || 'Seçin'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

export const StockFields = ({ stockQuantity, stockThreshold, onChangeStock, onChangeThreshold }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>Stok takibi (Opsiyonel)</Text>
    <View style={styles.dateRow}>
      <View style={styles.dateButton}>
        <Text style={styles.dateCaption}>Mevcut stok</Text>
        <TextInput
          style={styles.stockInput}
          keyboardType="number-pad"
          placeholder="30"
          placeholderTextColor={COLORS.textMuted}
          value={stockQuantity}
          onChangeText={onChangeStock}
        />
      </View>
      <View style={styles.dateButton}>
        <Text style={styles.dateCaption}>Uyarı eşiği</Text>
        <TextInput
          style={styles.stockInput}
          keyboardType="number-pad"
          placeholder="5"
          placeholderTextColor={COLORS.textMuted}
          value={stockThreshold}
          onChangeText={onChangeThreshold}
        />
      </View>
    </View>
  </View>
);

export const ProspectusField = ({ value, onChangeText, onFocus }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>Prospektüs bilgisi (Opsiyonel)</Text>
    <TextInput
      style={styles.notesInput}
      placeholder="Kullanım, yan etki, dikkat edilmesi gerekenler..."
      placeholderTextColor={COLORS.textMuted}
      value={value}
      onChangeText={onChangeText}
      onFocus={onFocus}
      multiline
    />
  </View>
);

export default ScheduleExtras;
