import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 17,
  },
});

export default styles;
