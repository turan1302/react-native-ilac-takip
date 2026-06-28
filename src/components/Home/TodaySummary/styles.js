import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  white: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  summaryBanner: '#E0E7FF',
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  summaryDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.summaryBanner,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  summaryBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBannerTextWrap: {
    flex: 1,
  },
  summaryBannerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  summaryBannerHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default styles;
