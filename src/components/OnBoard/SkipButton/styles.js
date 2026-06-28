import { StyleSheet } from 'react-native';

export const COLORS = {
  textMuted: '#6B7280',
};

export const createStyles = ({ isLandscape }) =>
  StyleSheet.create({
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
  });

export default createStyles;
