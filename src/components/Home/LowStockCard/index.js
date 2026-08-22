import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles from './styles';

const LowStockCard = ({ pills = [] }) => {
  if (!pills.length) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Feather name="alert-triangle" size={18} color="#B45309" />
      <View style={styles.textWrap}>
        <Text style={styles.title}>Stok uyarısı</Text>
        <Text style={styles.subtitle}>
          {pills.map(pill => `${pill.name} (${pill.stockQuantity})`).join(', ')} bitmeden yenileyin.
        </Text>
      </View>
    </View>
  );
};

export default LowStockCard;
