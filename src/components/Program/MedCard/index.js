import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DoseActions from '../../shared/DoseActions';
import styles, { COLORS } from './styles';

const MedCard = ({ item, status = 'pending', onTake, onSkip, onSnooze, onPressEdit }) => (
  <View style={styles.medCard}>
    <TouchableOpacity
      style={styles.medCardPressable}
      onPress={() => onPressEdit(item)}
      activeOpacity={0.7}
    >
      <View style={styles.medCardAccent} />
      <View style={styles.medIconWrapper}>
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.medInfo}>
        <Text style={styles.medName}>{item.name}</Text>
        <Text style={styles.medDetail}>
          {item.asNeeded ? item.dosage : `${item.time} • ${item.dosage}`}
        </Text>
        {item.isLowStock ? (
          <Text style={styles.stockWarning}>Stok azalıyor ({item.pill.stockQuantity})</Text>
        ) : null}
        {item.pill.prospectus ? (
          <TouchableOpacity onPress={() => Alert.alert('Prospektüs', item.pill.prospectus)}>
            <Text style={styles.prospectusLink}>Prospektüs</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
    <View style={styles.actionWrap}>
      <DoseActions
        status={item.isTaken ? 'taken' : status}
        compact
        onTake={() => onTake(item)}
        onSkip={() => onSkip(item)}
        onSnooze={item.asNeeded ? undefined : () => onSnooze(item)}
      />
    </View>
  </View>
);

export default MedCard;
