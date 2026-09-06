import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const MotivationCard = ({ weeklyCompliance }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.motivationCard,
        { backgroundColor: colors.primarySoft, borderColor: colors.border },
      ]}
    >
      <View style={[styles.motivationIcon, { backgroundColor: colors.card }]}>
        <Feather name="check-circle" size={22} color={colors.primary} />
      </View>
      <View style={styles.motivationContent}>
        <Text style={[styles.motivationTitle, { color: colors.text }]}>
          Harika Gidiyorsunuz!
        </Text>
        <Text style={[styles.motivationText, { color: colors.textSecondary }]}>
          Son 7 günlük ilaç uyumunuz %{weeklyCompliance}. Sağlığınız için böyle
          devam edin
        </Text>
      </View>
    </View>
  );
};

export default MotivationCard;
