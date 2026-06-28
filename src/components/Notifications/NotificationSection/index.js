import React from 'react';
import { View, Text } from 'react-native';
import NotificationCard from '../NotificationCard';
import styles from './styles';

const NotificationSection = ({
  title,
  items,
  onTake,
  onDismiss,
  onPressEdit,
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map(item => (
        <NotificationCard
          key={item.id}
          item={item}
          onTake={onTake}
          onDismiss={onDismiss}
          onPressEdit={onPressEdit}
        />
      ))}
    </View>
  );
};

export default NotificationSection;
