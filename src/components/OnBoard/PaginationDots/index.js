import React, { useMemo } from 'react';
import { View } from 'react-native';
import { createStyles } from './styles';

const PaginationDots = ({ slides, activeIndex }) => {
  const styles = useMemo(() => createStyles(), []);

  return (
    <View style={styles.dots}>
      {slides.map((slide, index) => (
        <View
          key={slide.id}
          style={[styles.dot, index === activeIndex && styles.dotActive]}
        />
      ))}
    </View>
  );
};

export default PaginationDots;
