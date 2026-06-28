import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles, { COLORS } from './styles';

const BackgroundSetupCard = ({ onPress }) => (
  <TouchableOpacity
    style={styles.backgroundSetupCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Feather name="alert-circle" size={18} color={COLORS.primary} />
    <View style={styles.backgroundSetupTextWrap}>
      <Text style={styles.backgroundSetupTitle}>Arka plan izinleri gerekli</Text>
      <Text style={styles.backgroundSetupSubtitle}>
        Uygulama kapalıyken bildirim almak için ayarları yapın
      </Text>
    </View>
    <Feather name="chevron-right" size={18} color={COLORS.primary} />
  </TouchableOpacity>
);

export default BackgroundSetupCard;
