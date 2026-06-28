import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#0D9488',
  white: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  cardBg: '#F0FDFA',
  cardBorder: '#CCFBF1',
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  appName: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
    fontWeight: '600',
  },
});

export default styles;
