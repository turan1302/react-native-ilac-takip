import { StyleSheet } from 'react-native';

export const COLORS = {
  text: '#111827',
  textSecondary: '#6B7280',
};

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
});

export default styles;
