import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  white: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  cardIconBg: '#DBEAFE',
  dismissedBorder: '#FDE68A',
  dismissedText: '#B45309',
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardDismissed: {
    backgroundColor: '#FFFBEB',
    borderColor: COLORS.dismissedBorder,
  },
  cardAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: COLORS.primary,
  },
  cardAccentDismissed: {
    backgroundColor: '#F59E0B',
  },
  cardPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.cardIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
    paddingVertical: 16,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  cardActions: {
    alignItems: 'flex-end',
    paddingRight: 12,
    paddingVertical: 12,
    gap: 6,
  },
  takeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  takeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  dismissButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  dismissButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  dismissedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.dismissedText,
    marginBottom: 4,
  },
});

export default styles;
