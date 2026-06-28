import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles, { COLORS } from './styles';

const EmptyState = ({
  title = 'Bildirim yok',
  description = 'Bugün için kaçırılmış ilaç hatırlatması bulunmuyor.',
}) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIcon}>
      <Feather name="bell-off" size={28} color={COLORS.primary} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyText}>{description}</Text>
  </View>
);

export default EmptyState;
