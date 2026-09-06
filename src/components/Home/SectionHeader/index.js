import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const SectionHeader = ({ onSeeAll }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={[styles.sectionListTitle, { color: colors.textMuted }]}>
        GELECEK İLAÇLAR
      </Text>
      <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
        <Text style={[styles.seeAllText, { color: colors.primary }]}>
          Tümünü Gör
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SectionHeader;
