import { StyleSheet } from 'react-native';

export const COLORS = {
  label: '#2563EB',
  white: '#FFFFFF',
  textSecondary: '#6B7280',
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
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  chipActive: {
    backgroundColor: COLORS.chipActiveBg,
    borderColor: COLORS.chipActiveBorder,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.chipActiveText,
    fontWeight: '600',
  },
});

export default styles;
