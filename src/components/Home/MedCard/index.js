import React from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
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
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

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
  const { colors } = useTheme();
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
  const photoUri = item.pill?.photoUri;

  return (
    <View
      style={[
        styles.medCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        item.isTaken && { opacity: 0.85 },
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
          style={[
            styles.medIconWrapper,
            { backgroundColor: colors.iconBg },
            item.isTaken && { backgroundColor: colors.primarySoft },
          ]}
        >
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={{ width: 48, height: 48, borderRadius: 12 }}
            />
          ) : (
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color={item.isTaken ? colors.textMuted : colors.primary}
            />
          )}
        </View>
        <View style={styles.medInfo}>
          <Text
            style={[
              styles.medName,
              { color: colors.text },
              item.isTaken && { color: colors.textMuted },
            ]}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.medDetail,
              { color: colors.textSecondary },
              item.isTaken && { color: colors.textMuted },
            ]}
          >
            {detail}
          </Text>
          {stockLabel ? (
            <Text style={[styles.stockWarning, { color: colors.warning }]}>
              {stockLabel}
            </Text>
          ) : null}
          {missedAdvice ? (
            <Text style={[styles.missedAdvice, { color: colors.warning }]}>
              {missedAdvice}
            </Text>
          ) : null}
          {item.pill.prospectus ? (
            <TouchableOpacity
              onPress={() => Alert.alert('Prospektüs', item.pill.prospectus)}
            >
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
