import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const SectionTitle = ({ title }) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
  );
};

export default SectionTitle;
