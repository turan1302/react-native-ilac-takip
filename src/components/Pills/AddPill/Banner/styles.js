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
