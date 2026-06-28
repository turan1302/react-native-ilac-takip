import { StyleSheet } from 'react-native';

export const COLORS = {
  textSecondary: '#6B7280',
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8,
  },
});

export default styles;
