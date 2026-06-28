import { StyleSheet } from 'react-native';

const COLORS = {
  primary: '#0D9488',
  primaryLight: '#CCFBF1',
  primaryDark: '#0F766E',
  white: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  dotInactive: '#D1D5DB',
};

const createStyles = ({ width, isLandscape }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    skipButton: {
      position: 'absolute',
      top: isLandscape ? 8 : 16,
      right: isLandscape ? 32 : 24,
      zIndex: 1,
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    skipText: {
      fontSize: 15,
      color: COLORS.textMuted,
      fontWeight: '500',
    },
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
    footer: {
      paddingHorizontal: isLandscape ? 48 : 32,
      paddingBottom: isLandscape ? 24 : 40,
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isLandscape ? 16 : 28,
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

export { COLORS, createStyles };
export default createStyles;
