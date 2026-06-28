import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles, { COLORS } from './styles';

const FormActions = ({
  saving,
  onSave,
  onCancel,
  saveLabel = 'Kaydet',
  disabled = false,
}) => (
  <>
    <TouchableOpacity
      style={styles.saveButton}
      onPress={onSave}
      activeOpacity={0.85}
      disabled={saving || disabled}
    >
      <Feather name="check-circle" size={20} color={COLORS.white} />
      <Text style={styles.saveButtonText}>{saveLabel}</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.cancelButton}
      onPress={onCancel}
      activeOpacity={0.85}
    >
      <Text style={styles.cancelButtonText}>Vazgeç</Text>
    </TouchableOpacity>
  </>
);

export default FormActions;
