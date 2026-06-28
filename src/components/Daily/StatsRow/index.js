import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const StatsRow = ({ todayCompliance, takenCount }) => (
  <View style={styles.statsRow}>
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>BUGÜN UYUM</Text>
      <Text style={styles.statValue}>%{todayCompliance}</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>TOPLAM ALINAN</Text>
      <Text style={styles.statValue}>
        {takenCount}
        <Text style={styles.statUnit}> Doz</Text>
      </Text>
    </View>
  </View>
);

export default StatsRow;
