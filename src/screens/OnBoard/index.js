import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useDimensionChange from '../../hooks/useDimensionChange';
import * as NavigationService from '../../common/NavigationService';
import { createStyles } from './styles';

const ONBOARD_SHOW_KEY = 'onboard_show';

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
  const styles = useMemo(
    () => createStyles({ width, isLandscape }),
    [width, isLandscape],
  );

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

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons
          name={item.icon}
          size={isLandscape ? 48 : 64}
          color="#0D9488"
        />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {!isLastSlide && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Atla</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={SLIDES}
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

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, index) => (
            <View
              key={slide.id}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Başla' : 'İleri'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnBoard;
