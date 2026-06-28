import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createStyles, COLORS } from './styles';

const OnBoardSlide = ({ item, width, isLandscape }) => {
  const styles = useMemo(
    () => createStyles({ width, isLandscape }),
    [width, isLandscape],
  );

  return (
    <View style={styles.slide}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons
          name={item.icon}
          size={isLandscape ? 48 : 64}
          color={COLORS.primary}
        />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );
};

export default OnBoardSlide;
