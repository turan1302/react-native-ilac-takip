import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DoseActions from '../../shared/DoseActions';
import { getMealRelationLabel } from '../../../common/pillFormConstants';
import { getStockEtaLabel } from '../../../common/stockHelpers';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const MedCard = ({ item, status = 'pending', onTake, onSkip, onSnooze, onPressEdit }) => {
  const { colors } = useTheme();
  const meal = getMealRelationLabel(item.pill?.mealRelation);
  const detail = item.asNeeded
    ? [item.dosage, meal].filter(Boolean).join(' • ')
    : [item.time, item.dosage, meal].filter(Boolean).join(' • ');
  const stockLabel = getStockEtaLabel(item.pill);

  return (
    <View
      style={[
        styles.medCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.medCardPressable}
        onPress={() => onPressEdit(item)}
        activeOpacity={0.7}
      >
        <View
          style={[styles.medCardAccent, { backgroundColor: colors.primary }]}
        />
        <View
          style={[styles.medIconWrapper, { backgroundColor: colors.iconBg }]}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.medInfo}>
          <Text style={[styles.medName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.medDetail, { color: colors.textSecondary }]}>
            {detail}
          </Text>
          {stockLabel ? (
            <Text style={[styles.stockWarning, { color: colors.warning }]}>
              {stockLabel}
            </Text>
          ) : null}
          {item.pill.prospectus ? (
            <TouchableOpacity onPress={() => Alert.alert('Prospektüs', item.pill.prospectus)}>
              <Text style={[styles.prospectusLink, { color: colors.primary }]}>
                Prospektüs
              </Text>
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
};

export default MedCard;
