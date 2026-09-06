import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getStockEtaLabel } from '../../../common/stockHelpers';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const LowStockCard = ({ pills = [] }) => {
  const { colors, isDark } = useTheme();

  if (!pills.length) {
    return null;
  }

  return (
    <View
      style={[
        styles.card,
        isDark && {
          backgroundColor: '#451A03',
          borderColor: colors.warning,
        },
      ]}
    >
      <Feather name="alert-triangle" size={18} color={colors.warning} />
      <View style={styles.textWrap}>
        <Text style={[styles.title, isDark && { color: colors.warning }]}>
          Reçeteyi yenile
        </Text>
        <Text style={[styles.subtitle, isDark && { color: colors.textSecondary }]}>
          {pills
            .map(pill => `${pill.name}: ${getStockEtaLabel(pill)}`)
            .join(' • ')}
        </Text>
      </View>
    </View>
  );
};

export default LowStockCard;
