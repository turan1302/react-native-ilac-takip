import React, { useRef, useState } from 'react';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import useDimensionChange from '../../hooks/useDimensionChange';
import * as NavigationService from '../../common/NavigationService';
import { ONBOARD_SHOW_KEY } from '../../common/storage/keys';
import Footer from '../../components/OnBoard/Footer';
import SkipButton from '../../components/OnBoard/SkipButton';
import SlideCarousel from '../../components/OnBoard/SlideCarousel';
import styles, { COLORS } from './styles';

const SLIDES = [
  {
    id: '1',
    icon: 'pill',
    title: 'İlaçlarınızı Kaydedin',
    description:
      'Kullandığınız ilaçları, türlerini ve dozajlarını kolayca ekleyin.',
  },
  {
    id: '2',
    icon: 'clock-outline',
    title: 'Saatlerinizi Belirleyin',
    description:
      'Günde kaç kez ve hangi saatlerde alacağınızı kendiniz ayarlayın.',
  },
  {
    id: '3',
    icon: 'bell-ring-outline',
    title: 'Zamanında Hatırlatın',
    description:
      'İlaç saatiniz geldiğinde bildirim alın, hiçbir dozu kaçırmayın.',
  },
];

const OnBoard = () => {
  const { width, isLandscape } = useDimensionChange();
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === SLIDES.length - 1;

  const completeOnboard = async () => {
    await AsyncStorage.setItem(ONBOARD_SHOW_KEY, 'true');
    NavigationService.reset();
  };

  const handleNext = async () => {
    if (isLastSlide) {
      await completeOnboard();
      return;
    }

    flatListRef.current?.scrollToIndex({
      index: activeIndex + 1,
      animated: true,
    });
  };

  const handleSkip = async () => {
    await completeOnboard();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <SkipButton
        visible={!isLastSlide}
        isLandscape={isLandscape}
        onPress={handleSkip}
      />

      <SlideCarousel
        flatListRef={flatListRef}
        slides={SLIDES}
        width={width}
        isLandscape={isLandscape}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <Footer
        slides={SLIDES}
        activeIndex={activeIndex}
        isLastSlide={isLastSlide}
        isLandscape={isLandscape}
        onNext={handleNext}
      />
    </SafeAreaView>
  );
};

export default OnBoard;
