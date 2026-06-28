import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
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
}) => (
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
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Tarih Seçin</Text>

          <View style={styles.pickerRow}>
            <ScrollView
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
            >
              {dayOptions.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.pickerItem,
                    tempDay === day && styles.pickerItemActive,
                  ]}
                  onPress={() => onSelectDay(day)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      tempDay === day && styles.pickerItemTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
            >
              {MONTH_NAMES.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.pickerItem,
                    tempMonth === index + 1 && styles.pickerItemActive,
                  ]}
                  onPress={() => onSelectMonth(index + 1)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      tempMonth === index + 1 && styles.pickerItemTextActive,
                    ]}
                  >
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
            >
              {yearOptions.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.pickerItem,
                    tempYear === year && styles.pickerItemActive,
                  ]}
                  onPress={() => onSelectYear(year)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      tempYear === year && styles.pickerItemTextActive,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={onGoToToday}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  styles.modalButtonTextSecondary,
                ]}
              >
                Bugün
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

export default DatePickerModal;
