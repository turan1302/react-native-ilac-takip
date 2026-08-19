import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MONTH_NAMES } from '../../../common/dailyHelpers';
import styles from './styles';

const DatePickerModal = ({
  visible,
  dayOptions,
  yearOptions,
  tempDay,
  tempMonth,
  tempYear,
  onClose,
  onSelectDay,
  onSelectMonth,
  onSelectYear,
  onGoToToday,
  onConfirm,
}) => {
  const insets = useSafeAreaInsets();

  return (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <TouchableOpacity
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <TouchableOpacity activeOpacity={1} onPress={() => {}}>
        <View style={[styles.modalContent, { paddingBottom: 32 + insets.bottom }]}>
          <Text style={styles.modalTitle}>Tarih Seçin</Text>

          <TouchableOpacity style={styles.todayButton} onPress={onGoToToday}>
            <Text style={styles.todayButtonText}>Bugüne Git</Text>
          </TouchableOpacity>

          <View style={styles.datePickerRow}>
            <ScrollView
              style={styles.datePickerColumn}
              showsVerticalScrollIndicator={false}
            >
              {dayOptions.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.datePickerItem,
                    tempDay === day && styles.datePickerItemActive,
                  ]}
                  onPress={() => onSelectDay(day)}
                >
                  <Text
                    style={[
                      styles.datePickerItemText,
                      tempDay === day && styles.datePickerItemTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView
              style={styles.datePickerColumn}
              showsVerticalScrollIndicator={false}
            >
              {MONTH_NAMES.map((month, index) => {
                const monthValue = index + 1;

                return (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.datePickerItem,
                      tempMonth === monthValue && styles.datePickerItemActive,
                    ]}
                    onPress={() => onSelectMonth(monthValue)}
                  >
                    <Text
                      style={[
                        styles.datePickerItemText,
                        tempMonth === monthValue &&
                          styles.datePickerItemTextActive,
                      ]}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <ScrollView
              style={styles.datePickerColumn}
              showsVerticalScrollIndicator={false}
            >
              {yearOptions.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.datePickerItem,
                    tempYear === year && styles.datePickerItemActive,
                  ]}
                  onPress={() => onSelectYear(year)}
                >
                  <Text
                    style={[
                      styles.datePickerItemText,
                      tempYear === year && styles.datePickerItemTextActive,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.modalConfirmButton}
            onPress={onConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.modalConfirmButtonText}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
  );
};

export default DatePickerModal;
