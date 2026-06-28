import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  progressTrack: '#DBEAFE',
};

const styles = StyleSheet.create({
  progressRing: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressRingTrack: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 7,
    borderColor: COLORS.progressTrack,
  },
  progressRingFill: {
    position: 'absolute',
    width: 72,
    height: 72,
  },
  progressClipRight: {
    position: 'absolute',
    left: 36,
    top: 0,
    width: 36,
    height: 72,
    overflow: 'hidden',
  },
  progressClipLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 36,
    height: 72,
    overflow: 'hidden',
  },
  progressArcHalf: {
    position: 'absolute',
    left: -36,
    top: 0,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 7,
    borderColor: COLORS.primary,
  },
  progressArcHalfLeft: {
    left: 0,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default styles;
