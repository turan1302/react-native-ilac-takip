import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

const getDimensions = () => {
  const { width, height } = Dimensions.get('window');
  const isPortrait = height >= width;
  const isLandscape = width > height;

  return {
    width,
    height,
    orientation: isPortrait ? 'portrait' : 'landscape',
    isPortrait,
    isLandscape,
  };
};

const useDimensionChange = () => {
  const [dimensions, setDimensions] = useState(getDimensions);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const { width, height } = window;
      const isPortrait = height >= width;
      const isLandscape = width > height;

      setDimensions({
        width,
        height,
        orientation: isPortrait ? 'portrait' : 'landscape',
        isPortrait,
        isLandscape,
      });
    });

    return () => subscription.remove();
  }, []);

  return dimensions;
};

export default useDimensionChange;
