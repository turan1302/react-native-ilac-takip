import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  white: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  cardAccent: '#2563EB',
  cardIconBg: '#DBEAFE',
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
  medDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  medCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
  actionWrap: {
    paddingRight: 10,
    paddingVertical: 8,
  },
  stockWarning: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  prospectusLink: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default styles;
