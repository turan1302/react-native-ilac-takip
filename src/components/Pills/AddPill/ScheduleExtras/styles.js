import { StyleSheet } from 'react-native';

export const COLORS = {
  label: '#2563EB',
  white: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  chipActiveBg: '#CCFBF1',
  chipActiveBorder: '#5EEAD4',
  chipActiveText: '#0F766E',
};

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.label,
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.chipActiveBg,
    borderColor: COLORS.chipActiveBorder,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.chipActiveText,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateCaption: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  stockInput: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    paddingVertical: 2,
  },
  notesInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 110,
    textAlignVertical: 'top',
  },
});

export default styles;
