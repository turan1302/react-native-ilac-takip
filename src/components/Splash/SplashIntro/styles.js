import { StyleSheet } from 'react-native';

export const COLORS = {
  white: '#FFFFFF',
  whiteSoft: 'rgba(255, 255, 255, 0.85)',
};

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.whiteSoft,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
});

export default styles;
