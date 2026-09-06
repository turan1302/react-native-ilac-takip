import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const SearchBar = ({ value, onChangeText, isDebouncing, onClear }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.searchBar,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Feather name="search" size={18} color={colors.textMuted} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder="İlaç adı, dozaj veya saat ara..."
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoFocus
        returnKeyType="search"
      />
      {isDebouncing ? (
        <ActivityIndicator
          style={styles.searchLoader}
          size="small"
          color={colors.primary}
        />
      ) : value.length > 0 ? (
        <TouchableOpacity
          style={styles.searchClearButton}
          onPress={onClear}
          activeOpacity={0.7}
        >
          <Feather name="x-circle" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SearchBar;
