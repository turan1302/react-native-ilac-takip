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
import { useTheme } from '../../../common/ThemeContext';
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
  const { colors } = useTheme();

  const renderColumn = (items, selected, onSelect, labelFn = v => v) => (
    <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
      {items.map(item => {
        const active = selected === item;
        return (
          <TouchableOpacity
            key={String(item)}
            style={[
              styles.pickerItem,
              active && {
                backgroundColor: colors.primarySoft,
              },
            ]}
            onPress={() => onSelect(item)}
          >
            <Text
              style={[
                styles.pickerItemText,
                { color: colors.text },
                active && { color: colors.primary, fontWeight: '700' },
              ]}
            >
              {labelFn(item)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

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
          <View
            style={[
              styles.modalContent,
              {
                paddingBottom: 32 + insets.bottom,
                backgroundColor: colors.card,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Tarih Seçin
            </Text>

            <View style={styles.pickerRow}>
              {renderColumn(dayOptions, tempDay, onSelectDay)}
              {renderColumn(
                MONTH_NAMES.map((_, i) => i + 1),
                tempMonth,
                onSelectMonth,
                m => MONTH_NAMES[m - 1],
              )}
              {renderColumn(yearOptions, tempYear, onSelectYear)}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonSecondary,
                  { backgroundColor: colors.background },
                ]}
                onPress={onGoToToday}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    styles.modalButtonTextSecondary,
                    { color: colors.text },
                  ]}
                >
                  Bugün
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
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
};

export default DatePickerModal;
