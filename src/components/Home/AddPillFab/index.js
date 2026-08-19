import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import styles, { COLORS } from './styles';

const AddPillFab = ({ onPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.fabContainer, { bottom: 20 + Math.min(insets.bottom, 8) }]}>
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <Feather name="plus" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

export default AddPillFab;
