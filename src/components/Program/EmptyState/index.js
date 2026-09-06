import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const EmptyState = ({
  title = 'Henüz ilaç eklenmedi',
  description = 'İlaçlarınızı ekleyerek günlük programınızı burada görüntüleyebilirsiniz',
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.emptyState,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
};

export default EmptyState;
