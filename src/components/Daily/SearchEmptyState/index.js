import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const SearchEmptyState = ({ query }) => (
  <View style={styles.searchEmptyState}>
    <Text style={styles.searchEmptyTitle}>Sonuç bulunamadı</Text>
    <Text style={styles.searchEmptyText}>
      "{query}" için eşleşen ilaç kaydı yok.
    </Text>
  </View>
);

export default SearchEmptyState;
