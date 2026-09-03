import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: 2,
  },
  barHit: {
    flex: 1,
    height: 40,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    minWidth: 3,
    borderRadius: 2,
  },
  barSelected: {
    borderWidth: 1,
    borderColor: '#1D4ED8',
  },
  caption: {
    marginTop: 8,
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default styles;
