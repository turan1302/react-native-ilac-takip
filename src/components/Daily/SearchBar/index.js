import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles, { COLORS } from './styles';

const SearchBar = ({
  value,
  onChangeText,
  isDebouncing,
  onClear,
}) => (
  <View style={styles.searchBar}>
    <Feather name="search" size={18} color={COLORS.textMuted} />
    <TextInput
      style={styles.searchInput}
      placeholder="İlaç adı, dozaj veya saat ara..."
      placeholderTextColor={COLORS.textMuted}
      value={value}
      onChangeText={onChangeText}
      autoFocus
      returnKeyType="search"
    />
    {isDebouncing ? (
      <ActivityIndicator
        style={styles.searchLoader}
        size="small"
        color={COLORS.primary}
      />
    ) : value.length > 0 ? (
      <TouchableOpacity
        style={styles.searchClearButton}
        onPress={onClear}
        activeOpacity={0.7}
      >
        <Feather name="x-circle" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    ) : null}
  </View>
);

export default SearchBar;
