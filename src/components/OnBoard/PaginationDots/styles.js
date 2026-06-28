import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#0D9488',
  dotInactive: '#D1D5DB',
};

export const createStyles = () =>
  StyleSheet.create({
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: COLORS.dotInactive,
    },
    dotActive: {
      width: 24,
      backgroundColor: COLORS.primary,
    },
  });

export default createStyles;
