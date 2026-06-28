import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#0D9488',
  white: '#FFFFFF',
};

export const createStyles = ({ isLandscape }) =>
  StyleSheet.create({
    nextButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 14,
      paddingVertical: isLandscape ? 12 : 16,
      alignItems: 'center',
    },
    nextButtonText: {
      fontSize: 17,
      fontWeight: '600',
      color: COLORS.white,
    },
  });

export default createStyles;
