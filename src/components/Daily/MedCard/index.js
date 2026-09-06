import React from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatTakenAt, getDetailText } from '../../../common/dailyHelpers';
import { getStockEtaLabel } from '../../../common/stockHelpers';
import { getMissedAdviceText } from '../../../common/scheduleAdjustments';
import { useTheme } from '../../../common/ThemeContext';
import DoseActions from '../../shared/DoseActions';
import styles from './styles';

const MedCard = ({ item, statusInfo, onTake, onSkip, onSnooze, onPressEdit }) => {
  const { colors } = useTheme();
  const status = statusInfo.status;
  const stockLabel = getStockEtaLabel(item.pill);
  const missedAdvice =
    status === 'skipped' ? getMissedAdviceText(item.pill) : '';
  const photoUri = item.pill?.photoUri;

  return (
    <View
      style={[
        styles.medCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        status === 'pending' && styles.medCardPending,
        status === 'pending' && {
          backgroundColor: colors.pendingBg,
          borderColor: colors.pendingBorder,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.medCardPressable}
        onPress={() => onPressEdit(item)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.medCardAccent,
            { backgroundColor: colors.primary },
            status === 'skipped' && { backgroundColor: colors.danger },
          ]}
        />
        <View
          style={[styles.medIconWrapper, { backgroundColor: colors.iconBg }]}
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
              color={colors.primary}
            />
          )}
        </View>
        <View style={styles.medInfo}>
          <Text style={[styles.medName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.medDetail, { color: colors.textSecondary }]}>
            {getDetailText(item)}
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
            <TouchableOpacity onPress={() => Alert.alert('Prospektüs', item.pill.prospectus)}>
              <Text style={[styles.prospectusLink, { color: colors.primary }]}>
                Prospektüs
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>

      <View style={styles.medAction}>
        <DoseActions
          status={status}
          takenAt={formatTakenAt(statusInfo.takenAt)}
          onTake={() => onTake(item)}
          onSkip={() => onSkip(item)}
          onSnooze={item.asNeeded ? undefined : () => onSnooze(item)}
        />
      </View>
    </View>
  );
};

export default MedCard;
