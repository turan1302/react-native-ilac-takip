import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles, { COLORS } from './styles';

const TabBarItem = ({ focused, icon, label }) => {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  }, [focused, progress]);

  const scale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.18, 1.08],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1],
  });

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ transform: [{ scale }, { translateY }] }}>
        <Feather
          name={icon}
          size={22}
          color={focused ? COLORS.active : COLORS.inactive}
        />
      </Animated.View>
      <Text
        numberOfLines={1}
        style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}
      >
        {label}
      </Text>
    </View>
  );
};

export default TabBarItem;
