import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PILL_TYPES } from '../../../../common/pillFormConstants';
import styles from './styles';

const TypePickerModal = ({
  visible,
  selectedType,
  onClose,
  onSelect,
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
          <Text style={styles.modalTitle}>Tür Seçin</Text>
          {PILL_TYPES.map(item => (
            <TouchableOpacity
              key={item}
              style={styles.modalOption}
              onPress={() => onSelect(item)}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  selectedType === item && styles.modalOptionTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
  );
};

export default TypePickerModal;
