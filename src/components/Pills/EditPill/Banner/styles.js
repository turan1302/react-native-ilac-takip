import { StyleSheet } from 'react-native';

export const COLORS = {
  white: '#FFFFFF',
  bannerOverlay: 'rgba(0, 0, 0, 0.35)',
};

const styles = StyleSheet.create({
  banner: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#1E3A5F',
    justifyContent: 'flex-end',
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#334155',
  },
  bannerDecor: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bannerDecorSmall: {
    position: 'absolute',
    top: 48,
    right: 64,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bannerOverlay: {
    padding: 16,
    backgroundColor: COLORS.bannerOverlay,
  },
  bannerText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    lineHeight: 22,
  },
});

export default styles;
