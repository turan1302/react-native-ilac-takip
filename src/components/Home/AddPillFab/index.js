import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const AddPillFab = ({ onPress }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[styles.fabContainer, { bottom: 20 + Math.min(insets.bottom, 8) }]}
    >
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.fab }]}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default AddPillFab;
