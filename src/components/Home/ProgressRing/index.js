import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const ProgressRing = ({ percent }) => {
  const { colors } = useTheme();
  const p = Math.min(100, Math.max(0, percent));
  const angle = (p / 100) * 360;
  const showSecondHalf = angle > 180;

  return (
    <View style={styles.progressRing}>
      <View
        style={[styles.progressRingTrack, { borderColor: colors.border }]}
      />

      {p > 0 && (
        <View style={styles.progressRingFill}>
          <View style={styles.progressClipRight}>
            <View
              style={[
                styles.progressArcHalf,
                {
                  borderColor: colors.primary,
                  transform: [
                    { rotate: `${-180 + Math.min(angle, 180)}deg` },
                  ],
                },
              ]}
            />
          </View>

          {showSecondHalf && (
            <View style={styles.progressClipLeft}>
              <View
                style={[
                  styles.progressArcHalf,
                  styles.progressArcHalfLeft,
                  {
                    borderColor: colors.primary,
                    transform: [
                      { rotate: `${-180 + (angle - 180)}deg` },
                    ],
                  },
                ]}
              />
            </View>
          )}
        </View>
      )}

      <Text style={[styles.progressText, { color: colors.text }]}>{p}%</Text>
    </View>
  );
};

export default ProgressRing;
