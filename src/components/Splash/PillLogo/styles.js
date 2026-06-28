import { StyleSheet } from 'react-native';

export const COLORS = {
  pillLight: '#5EEAD4',
  pillDark: '#14B8A6',
};

const styles = StyleSheet.create({
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    transform: [{ rotate: '-35deg' }],
  },
  pillHalf: {
    width: 36,
    height: 56,
    borderRadius: 28,
  },
  pillHalfLeft: {
    backgroundColor: COLORS.pillLight,
    marginRight: -8,
  },
  pillHalfRight: {
    backgroundColor: COLORS.pillDark,
    marginLeft: -8,
  },
});

export default styles;
