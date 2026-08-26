import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  cardOverdue: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  cardUpcoming: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOverdue: {
    backgroundColor: '#FDE68A',
  },
  iconUpcoming: {
    backgroundColor: '#CCFBF1',
  },
  textWrap: {
    flex: 1,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  kickerOverdue: {
    color: '#B45309',
  },
  kickerUpcoming: {
    color: '#0F766E',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
  takeButton: {
    backgroundColor: '#0D9488',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  takeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default styles;
