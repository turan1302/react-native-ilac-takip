import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  white: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  cardAccent: '#2563EB',
  cardAccentSkipped: '#EF4444',
  cardIconBg: '#DBEAFE',
  takenBadgeBg: '#D1FAE5',
  takenBadgeText: '#059669',
  skippedBadgeBg: '#FEE2E2',
  skippedBadgeText: '#DC2626',
  pendingBg: '#F0F9FF',
  pendingBorder: '#93C5FD',
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
  medCardPending: {
    backgroundColor: COLORS.pendingBg,
    borderStyle: 'dashed',
    borderColor: COLORS.pendingBorder,
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
  medCardAccentSkipped: {
    backgroundColor: COLORS.cardAccentSkipped,
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
  medAction: {
    alignItems: 'flex-end',
    paddingRight: 16,
    paddingVertical: 12,
    minWidth: 100,
  },
  takenBadge: {
    backgroundColor: COLORS.takenBadgeBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
  },
  takenBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.takenBadgeText,
  },
  takenTimeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  skippedBadge: {
    backgroundColor: COLORS.skippedBadgeBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
  },
  skippedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.skippedBadgeText,
  },
  takeNowText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  takeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  takeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default styles;
