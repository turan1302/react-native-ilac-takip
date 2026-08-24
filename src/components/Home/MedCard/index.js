import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DoseActions from '../../shared/DoseActions';
import { getMealRelationLabel } from '../../../common/pillFormConstants';
import { getStockEtaLabel } from '../../../common/stockHelpers';
import styles, { COLORS } from './styles';

const MedCard = ({ item, status = 'pending', takenAt, onTake, onSkip, onSnooze, onPressEdit }) => {
  const meal = getMealRelationLabel(item.pill?.mealRelation);
  const detail = item.asNeeded
    ? [item.dosage, meal].filter(Boolean).join(' • ')
    : [item.time, item.dosage, meal].filter(Boolean).join(' • ');
  const stockLabel = getStockEtaLabel(item.pill);

  return (
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
            {detail}
          </Text>
          {stockLabel ? (
            <Text style={styles.stockWarning}>{stockLabel}</Text>
          ) : null}
          {item.pill.prospectus ? (
            <TouchableOpacity
              onPress={() => Alert.alert('Prospektüs', item.pill.prospectus)}
            >
              <Text style={styles.prospectusLink}>Prospektüs</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
      <View style={styles.actionWrap}>
        <DoseActions
          status={item.isTaken ? 'taken' : status}
          takenAt={takenAt}
          compact
          onTake={() => onTake(item)}
          onSkip={() => onSkip(item)}
          onSnooze={item.asNeeded ? undefined : () => onSnooze(item)}
        />
      </View>
    </View>
  );
};

export default MedCard;
