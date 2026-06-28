import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const EmptyState = ({
  title = 'Bu gün için kayıt yok',
  description = 'Seçili tarihte planlanmış ilaç bulunmuyor.',
}) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyText}>{description}</Text>
  </View>
);

export default EmptyState;
