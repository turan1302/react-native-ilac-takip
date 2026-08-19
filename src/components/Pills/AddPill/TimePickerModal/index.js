import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HOURS, MINUTES } from '../../../../common/pillFormConstants';
import styles from './styles';

const TimePickerModal = ({
  visible,
  tempHour,
  tempMinute,
  onClose,
  onSelectHour,
  onSelectMinute,
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
          <Text style={styles.modalTitle}>Saat Seçin</Text>

          <View style={styles.timePickerRow}>
            <ScrollView
              style={styles.timePickerColumn}
              showsVerticalScrollIndicator={false}
            >
              {HOURS.map(hour => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.timePickerItem,
                    tempHour === hour && styles.timePickerItemActive,
                  ]}
                  onPress={() => onSelectHour(hour)}
                >
                  <Text
                    style={[
                      styles.timePickerItemText,
                      tempHour === hour && styles.timePickerItemTextActive,
                    ]}
                  >
                    {hour}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.timePickerSeparator}>:</Text>

            <ScrollView
              style={styles.timePickerColumn}
              showsVerticalScrollIndicator={false}
            >
              {MINUTES.map(minute => (
                <TouchableOpacity
                  key={minute}
                  style={[
                    styles.timePickerItem,
                    tempMinute === minute && styles.timePickerItemActive,
                  ]}
                  onPress={() => onSelectMinute(minute)}
                >
                  <Text
                    style={[
                      styles.timePickerItemText,
                      tempMinute === minute && styles.timePickerItemTextActive,
                    ]}
                  >
                    {minute}
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

export default TimePickerModal;
