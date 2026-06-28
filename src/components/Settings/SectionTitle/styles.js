import { StyleSheet } from 'react-native';

export const COLORS = {
  textMuted: '#9CA3AF',
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
});

export default styles;
