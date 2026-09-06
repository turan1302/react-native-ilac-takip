import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const StatsRow = ({ todayCompliance, takenCount }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.statsRow}>
      <View
        style={[
          styles.statCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>
          BUGÜN UYUM
        </Text>
        <Text style={[styles.statValue, { color: colors.text }]}>
          %{todayCompliance}
        </Text>
      </View>
      <View
        style={[
          styles.statCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>
          TOPLAM ALINAN
        </Text>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {takenCount}
          <Text style={[styles.statUnit, { color: colors.textSecondary }]}>
            {' '}
            Doz
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default StatsRow;
