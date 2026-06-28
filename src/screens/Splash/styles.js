import { StyleSheet } from 'react-native';

const COLORS = {
  primary: '#0D9488',
  primaryDark: '#0F766E',
  white: '#FFFFFF',
  whiteSoft: 'rgba(255, 255, 255, 0.85)',
  whiteMuted: 'rgba(255, 255, 255, 0.6)',
  pillLight: '#5EEAD4',
  pillDark: '#14B8A6',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
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
