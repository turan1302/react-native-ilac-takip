import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  white: '#FFFFFF',
  text: '#111827',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  calendarActive: '#1E3A8A',
};

const styles = StyleSheet.create({
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  calendarLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calendarLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  calendarCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarDay: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  calendarDayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  calendarDayLabelActive: {
    color: COLORS.primary,
  },
  calendarDate: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDateActive: {
    backgroundColor: COLORS.calendarActive,
  },
  calendarDateText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  calendarDateTextActive: {
    color: COLORS.white,
  },
  calendarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.white,
    marginTop: -2,
  },
});

export default styles;
