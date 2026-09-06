import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const SearchEmptyState = ({ query }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.searchEmptyState,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.searchEmptyTitle, { color: colors.text }]}>
        Sonuç bulunamadı
      </Text>
      <Text style={[styles.searchEmptyText, { color: colors.textSecondary }]}>
        "{query}" için eşleşen ilaç kaydı yok
      </Text>
    </View>
  );
};

export default SearchEmptyState;
