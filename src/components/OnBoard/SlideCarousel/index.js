import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
import OnBoardSlide from '../OnBoardSlide';

const SlideCarousel = ({
  flatListRef,
  slides,
  width,
  isLandscape,
  onViewableItemsChanged,
  viewabilityConfig,
}) => {
  const renderSlide = useCallback(
    ({ item }) => (
      <OnBoardSlide item={item} width={width} isLandscape={isLandscape} />
    ),
    [width, isLandscape],
  );

  return (
    <FlatList
      ref={flatListRef}
      data={slides}
      renderItem={renderSlide}
      keyExtractor={item => item.id}
      horizontal
      pagingEnabled
      bounces={false}
      showsHorizontalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      getItemLayout={(_, index) => ({
        length: width,
        offset: width * index,
        index,
      })}
    />
  );
};

export default SlideCarousel;
