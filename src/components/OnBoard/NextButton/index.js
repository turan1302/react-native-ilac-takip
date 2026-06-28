import React, { useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createStyles } from './styles';

const NextButton = ({ isLastSlide, isLandscape, onPress }) => {
  const styles = useMemo(
    () => createStyles({ isLandscape }),
    [isLandscape],
  );

  return (
    <TouchableOpacity style={styles.nextButton} onPress={onPress}>
      <Text style={styles.nextButtonText}>
        {isLastSlide ? 'Başla' : 'İleri'}
      </Text>
    </TouchableOpacity>
  );
};

export default NextButton;
