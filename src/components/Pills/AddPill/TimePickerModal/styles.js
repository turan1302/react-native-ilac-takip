import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  white: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primaryLight: '#DBEAFE',
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  timePickerColumn: {
    flex: 1,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  timePickerItem: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  timePickerItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  timePickerItemText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  timePickerItemTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  timePickerSeparator: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalConfirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default styles;
