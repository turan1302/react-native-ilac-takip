import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles, { COLORS } from './styles';

const MotivationCard = ({ weeklyCompliance }) => (
  <View style={styles.motivationCard}>
    <View style={styles.motivationIcon}>
      <Feather name="check-circle" size={22} color={COLORS.primary} />
    </View>
    <View style={styles.motivationContent}>
      <Text style={styles.motivationTitle}>Harika Gidiyorsunuz!</Text>
      <Text style={styles.motivationText}>
        Son 7 günlük ilaç uyumunuz %{weeklyCompliance}. Sağlığınız için böyle
        devam edin.
      </Text>
    </View>
  </View>
);

export default MotivationCard;
