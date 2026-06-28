import { StyleSheet } from 'react-native';

export const COLORS = {
  white: '#FFFFFF',
  whiteMuted: 'rgba(255, 255, 255, 0.6)',
};

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.whiteMuted,
    marginTop: 12,
  },
});

export default styles;
