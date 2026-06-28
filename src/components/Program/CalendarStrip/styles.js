import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  white: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
};

const styles = StyleSheet.create({
  calendarCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarDay: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  calendarDayLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 6,
    fontWeight: '500',
  },
  calendarDayLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  calendarDate: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDateActive: {
    backgroundColor: COLORS.primary,
  },
  calendarDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  calendarDateTextActive: {
    color: COLORS.white,
  },
});

export default styles;
