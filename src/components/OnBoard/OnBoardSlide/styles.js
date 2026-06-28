import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#0D9488',
  primaryLight: '#CCFBF1',
  text: '#1F2937',
  textMuted: '#6B7280',
};

export const createStyles = ({ width, isLandscape }) =>
  StyleSheet.create({
    slide: {
      width,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: isLandscape ? 64 : 40,
    },
    iconWrapper: {
      width: isLandscape ? 96 : 140,
      height: isLandscape ? 96 : 140,
      borderRadius: isLandscape ? 48 : 70,
      backgroundColor: COLORS.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isLandscape ? 20 : 40,
    },
    title: {
      fontSize: isLandscape ? 22 : 26,
      fontWeight: '700',
      color: COLORS.text,
      textAlign: 'center',
      marginBottom: isLandscape ? 10 : 16,
    },
    description: {
      fontSize: isLandscape ? 14 : 16,
      color: COLORS.textMuted,
      textAlign: 'center',
      lineHeight: isLandscape ? 20 : 24,
      maxWidth: isLandscape ? width * 0.6 : undefined,
    },
  });

export default createStyles;
