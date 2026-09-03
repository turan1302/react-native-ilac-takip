import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DoseActions from '../../shared/DoseActions';
import { getMealRelationLabel } from '../../../common/pillFormConstants';
import { getStockEtaLabel } from '../../../common/stockHelpers';
import {
  getDoseDisplayTime,
  getMissedAdviceText,
} from '../../../common/scheduleAdjustments';
import { isPastScheduledTime } from '../../../common/inAppNotificationHelpers';
import { getTodayDateKey } from '../../../common/IntakeStorage';
import styles, { COLORS } from './styles';

const MedCard = ({
  item,
  status = 'pending',
  takenAt,
  onTake,
  onSkip,
  onSnooze,
  onPressEdit,
  dateKey,
}) => {
  const meal = getMealRelationLabel(item.pill?.mealRelation);
  const shownTime = getDoseDisplayTime(item);
  const detail = item.asNeeded
    ? [item.dosage, meal].filter(Boolean).join(' • ')
    : [shownTime, item.dosage, meal].filter(Boolean).join(' • ');
  const stockLabel = getStockEtaLabel(item.pill);
  const overdue =
    !item.asNeeded &&
    !item.isTaken &&
    isPastScheduledTime(shownTime, dateKey || getTodayDateKey());
  const missedAdvice = overdue ? getMissedAdviceText(item.pill) : '';

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
          {missedAdvice ? (
            <Text style={styles.missedAdvice}>{missedAdvice}</Text>
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
