import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  cardWarn: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  cardOk: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  titleWarn: {
    color: '#92400E',
  },
  titleOk: {
    color: '#047857',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  subWarn: {
    color: '#B45309',
  },
  subOk: {
    color: '#059669',
  },
});

export default styles;
