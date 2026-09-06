import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const BackgroundSetupCard = ({
  onPress,
  title = 'Bildirim izni gerekli',
  subtitle = 'İlaç hatırlatmalarını almak için bildirim iznini açın',
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.backgroundSetupCard,
        { backgroundColor: colors.primarySoft, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Feather name="alert-circle" size={18} color={colors.primary} />
      <View style={styles.backgroundSetupTextWrap}>
        <Text style={[styles.backgroundSetupTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text
          style={[styles.backgroundSetupSubtitle, { color: colors.textSecondary }]}
        >
          {subtitle}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.primary} />
    </TouchableOpacity>
  );
};

export default BackgroundSetupCard;
