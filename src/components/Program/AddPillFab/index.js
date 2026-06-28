import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles, { COLORS } from './styles';

const AddPillFab = ({ onPress }) => (
  <View style={styles.fabContainer}>
    <TouchableOpacity
      style={styles.fab}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Feather name="plus" size={28} color={COLORS.white} />
    </TouchableOpacity>
  </View>
);

export default AddPillFab;
