import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const EmptyState = ({
  title = 'Henüz ilaç eklenmedi',
  description = 'İlaçlarınızı ekleyerek günlük programınızı burada görüntüleyebilirsiniz.',
}) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyText}>{description}</Text>
  </View>
);

export default EmptyState;
