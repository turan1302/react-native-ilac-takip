import React, { useMemo } from 'react';
import { View } from 'react-native';
import NextButton from '../NextButton';
import PaginationDots from '../PaginationDots';
import { createStyles } from './styles';

const Footer = ({
  slides,
  activeIndex,
  isLastSlide,
  isLandscape,
  onNext,
}) => {
  const styles = useMemo(
    () => createStyles({ isLandscape }),
    [isLandscape],
  );

  return (
    <View style={styles.footer}>
      <View style={styles.dotsWrapper}>
        <PaginationDots slides={slides} activeIndex={activeIndex} />
      </View>
      <NextButton
        isLastSlide={isLastSlide}
        isLandscape={isLandscape}
        onPress={onNext}
      />
    </View>
  );
};

export default Footer;
