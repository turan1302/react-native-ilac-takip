import React, { useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createStyles } from './styles';

const SkipButton = ({ visible, isLandscape, onPress }) => {
  const styles = useMemo(
    () => createStyles({ isLandscape }),
    [isLandscape],
  );

  if (!visible) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.skipButton} onPress={onPress}>
      <Text style={styles.skipText}>Atla</Text>
    </TouchableOpacity>
  );
};

export default SkipButton;
