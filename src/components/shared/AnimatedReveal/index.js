import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const AnimatedReveal = ({
  children,
  index = 0,
  step = 55,
  duration = 420,
  distance = 18,
  animationKey = 'default',
  style,
}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay: index * step,
      useNativeDriver: true,
    }).start();
  }, [animationKey, duration, index, progress, step]);

  return (
    <Animated.View
      style={[
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
              }),
            },
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.97, 1],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedReveal;
