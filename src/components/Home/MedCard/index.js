import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles, { COLORS } from './styles';

const MedCard = ({ item, onToggleTaken, onPressEdit }) => (
  <View style={[styles.medCard, item.isTaken && styles.medCardTaken]}>
    <TouchableOpacity
      style={styles.medCardPressable}
      onPress={() => onPressEdit(item)}
      activeOpacity={0.7}
    >
      <View style={styles.medCardAccent} />
      <View
        style={[
          styles.medIconWrapper,
          item.isTaken && styles.medIconWrapperTaken,
        ]}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={item.isTaken ? COLORS.textMuted : COLORS.primary}
        />
      </View>
      <View style={styles.medInfo}>
        <Text style={[styles.medName, item.isTaken && styles.medNameTaken]}>
          {item.name}
        </Text>
        <Text style={[styles.medDetail, item.isTaken && styles.medDetailTaken]}>
          {item.asNeeded ? item.dosage : `${item.time} • ${item.dosage}`}
        </Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.medCheckbox, item.isTaken && styles.medCheckboxTaken]}
      onPress={() => onToggleTaken(item)}
      activeOpacity={0.7}
    >
      {item.isTaken && (
        <MaterialCommunityIcons name="check-all" size={16} color={COLORS.white} />
      )}
    </TouchableOpacity>
  </View>
);

export default MedCard;
