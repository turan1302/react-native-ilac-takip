import { StyleSheet } from 'react-native';

export const COLORS = {
  textMuted: '#9CA3AF',
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionTimeRange: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
});

export default styles;
