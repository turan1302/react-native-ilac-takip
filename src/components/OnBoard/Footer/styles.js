import { StyleSheet } from 'react-native';

export const createStyles = ({ isLandscape }) =>
  StyleSheet.create({
    footer: {
      paddingHorizontal: isLandscape ? 48 : 32,
      paddingBottom: isLandscape ? 24 : 40,
    },
    dotsWrapper: {
      marginBottom: isLandscape ? 16 : 28,
    },
  });

export default createStyles;
