import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AnimatedReveal from '../../shared/AnimatedReveal';
import MedCard from '../MedCard';
import styles from './styles';

const PillSection = ({
  section,
  onTake,
  onSkip,
  onSnooze,
  onPressEdit,
  animationKey,
  startIndex = 0,
}) => (
  <View>
    <AnimatedReveal index={startIndex} animationKey={animationKey} distance={12}>
      <View style={styles.timeSectionHeader}>
        <Feather name={section.icon} size={14} color={section.color} />
        <Text style={[styles.timeSectionTitle, { color: section.color }]}>
          {section.title}
        </Text>
      </View>
    </AnimatedReveal>

    {section.items.map((item, index) => (
      <AnimatedReveal
        key={item.id}
        index={startIndex + index + 1}
        animationKey={animationKey}
      >
        <MedCard
          item={item}
          onTake={onTake}
          onSkip={onSkip}
          onSnooze={onSnooze}
          onPressEdit={onPressEdit}
        />
      </AnimatedReveal>
    ))}
  </View>
);

export default PillSection;
