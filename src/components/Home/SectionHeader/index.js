import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';

const SectionHeader = ({ onSeeAll }) => (
  <View style={styles.sectionHeaderRow}>
    <Text style={styles.sectionListTitle}>GELECEK İLAÇLAR</Text>
    <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
      <Text style={styles.seeAllText}>Tümünü Gör</Text>
    </TouchableOpacity>
  </View>
);

export default SectionHeader;
