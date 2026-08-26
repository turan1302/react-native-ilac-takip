import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#24C0B8',
  white: '#FFFFFF',
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 20,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  headline: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  takeButton: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 36,
    paddingVertical: 14,
    minWidth: 180,
    alignItems: 'center',
    marginBottom: 14,
  },
  takeButtonText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipButtonText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default styles;
