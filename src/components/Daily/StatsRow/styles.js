import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  textSecondary: '#6B7280',
  statCardBg: '#EFF6FF',
  statCardBorder: '#DBEAFE',
};

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.statCardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.statCardBorder,
    padding: 16,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default styles;
