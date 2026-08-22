import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
    maxWidth: 210,
  },
  actionsCompact: {
    maxWidth: 180,
  },
  takeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  takeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  snoozeButton: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  snoozeButtonText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '700',
  },
  skipButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  skipButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  takenBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  takenBadgeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  skippedBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  skippedBadgeText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  meta: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  link: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
});

export default styles;
