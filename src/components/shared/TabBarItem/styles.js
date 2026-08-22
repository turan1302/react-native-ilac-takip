import { StyleSheet } from 'react-native';

export const COLORS = {
  active: '#047857',
  inactive: '#9CA3AF',
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '600',
  },
  labelActive: {
    color: COLORS.active,
  },
  labelInactive: {
    color: COLORS.inactive,
    fontWeight: '500',
  },
});

export default styles;
