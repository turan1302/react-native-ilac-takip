import React from 'react';
import { View, Text } from 'react-native';
import AnimatedReveal from '../../shared/AnimatedReveal';
import NotificationCard from '../NotificationCard';
import styles from './styles';

const NotificationSection = ({
  title,
  items,
  onTake,
  onDismiss,
  onPressEdit,
  animationKey,
  startIndex = 0,
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <View>
      <AnimatedReveal index={startIndex} animationKey={animationKey} distance={12}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </AnimatedReveal>
      {items.map((item, index) => (
        <AnimatedReveal
          key={item.id}
          index={startIndex + index + 1}
          animationKey={animationKey}
        >
          <NotificationCard
            item={item}
            onTake={onTake}
            onDismiss={onDismiss}
            onPressEdit={onPressEdit}
          />
        </AnimatedReveal>
      ))}
    </View>
  );
};

export default NotificationSection;
