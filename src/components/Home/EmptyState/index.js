import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const EmptyState = ({
  title = 'Bugün için ilaç yok',
  description = 'İlaç ekleyerek günlük programınızı oluşturabilirsiniz.',
}) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyText}>{description}</Text>
  </View>
);

export default EmptyState;
