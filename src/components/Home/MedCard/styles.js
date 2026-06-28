import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  white: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  cardAccent: '#2563EB',
  cardIconBg: '#DBEAFE',
  cardIconBgTaken: '#E5E7EB',
  checkboxBorder: '#D1D5DB',
};

const styles = StyleSheet.create({
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  medCardPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  medCardTaken: {
    opacity: 0.85,
  },
  medCardAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: COLORS.cardAccent,
  },
  medIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.cardIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
    marginRight: 12,
  },
  medIconWrapperTaken: {
    backgroundColor: COLORS.cardIconBgTaken,
  },
  medInfo: {
    flex: 1,
    paddingVertical: 16,
  },
  medName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  medNameTaken: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  medDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  medDetailTaken: {
    color: COLORS.textMuted,
  },
  medCheckbox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.checkboxBorder,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medCheckboxTaken: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
});

export default styles;
