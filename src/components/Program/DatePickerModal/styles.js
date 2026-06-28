import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  white: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  cardIconBg: '#DBEAFE',
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
    marginBottom: 16,
  },
  todayButton: {
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 10,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  datePickerColumn: {
    flex: 1,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  datePickerItem: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  datePickerItemActive: {
    backgroundColor: COLORS.cardIconBg,
  },
  datePickerItemText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  datePickerItemTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
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
