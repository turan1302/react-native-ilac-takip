import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#0D9488',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  white: '#FFFFFF',
  chipBg: '#CCFBF1',
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.chipBg,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 120,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    maxHeight: 360,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowActive: {
    backgroundColor: '#F0FDFA',
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderBottomWidth: 0,
  },
  rowText: {
    fontSize: 15,
    color: COLORS.text,
  },
  rowTextActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default styles;
