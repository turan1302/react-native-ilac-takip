import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatTakenAt, getDetailText } from '../../../common/dailyHelpers';
import styles, { COLORS } from './styles';

const MedCard = ({ item, statusInfo, onTake, onPressEdit }) => {
  const isPending = statusInfo.status === 'pending';
  const isSkipped = statusInfo.status === 'skipped';
  const isTaken = statusInfo.status === 'taken';

  return (
    <View style={[styles.medCard, isPending && styles.medCardPending]}>
      <TouchableOpacity
        style={styles.medCardPressable}
        onPress={() => onPressEdit(item)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.medCardAccent,
            isSkipped && styles.medCardAccentSkipped,
          ]}
        />
        <View style={styles.medIconWrapper}>
          <MaterialCommunityIcons
            name={item.icon}
            size={24}
            color={COLORS.primary}
          />
        </View>
        <View style={styles.medInfo}>
          <Text style={styles.medName}>{item.name}</Text>
          <Text style={styles.medDetail}>{getDetailText(item)}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.medAction}>
        {isTaken && (
          <>
            <View style={styles.takenBadge}>
              <Text style={styles.takenBadgeText}>Alındı</Text>
            </View>
            <Text style={styles.takenTimeText}>
              {formatTakenAt(statusInfo.takenAt)}
            </Text>
          </>
        )}

        {isSkipped && (
          <>
            <View style={styles.skippedBadge}>
              <Text style={styles.skippedBadgeText}>Atlandı</Text>
            </View>
            <TouchableOpacity onPress={() => onTake(item)} activeOpacity={0.7}>
              <Text style={styles.takeNowText}>Şimdi Al</Text>
            </TouchableOpacity>
          </>
        )}

        {isPending && (
          <TouchableOpacity
            style={styles.takeButton}
            onPress={() => onTake(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.takeButtonText}>Al</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default MedCard;
