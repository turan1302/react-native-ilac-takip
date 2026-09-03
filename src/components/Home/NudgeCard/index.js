import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getMissedAdviceText } from '../../../common/scheduleAdjustments';
import styles from './styles';

const NudgeCard = ({ snapshot, onTake }) => {
  if (!snapshot || snapshot.kind === 'empty' || snapshot.kind === 'done') {
    return null;
  }

  const overdue = snapshot.kind === 'overdue';
  const missedAdvice = overdue
    ? getMissedAdviceText(snapshot.items?.[0]?.pill)
    : '';

  return (
    <View style={[styles.card, overdue ? styles.cardOverdue : styles.cardUpcoming]}>
      <View style={[styles.iconWrap, overdue ? styles.iconOverdue : styles.iconUpcoming]}>
        <Feather
          name={overdue ? 'bell' : 'clock'}
          size={18}
          color={overdue ? '#B45309' : '#0F766E'}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.kicker, overdue ? styles.kickerOverdue : styles.kickerUpcoming]}>
          {snapshot.kicker}
        </Text>
        <Text style={styles.title}>{snapshot.headline}</Text>
        <Text style={styles.subtitle}>{snapshot.subtitle}</Text>
        {missedAdvice ? (
          <Text style={styles.subtitle}>{missedAdvice}</Text>
        ) : null}
      </View>
      <TouchableOpacity style={styles.takeButton} onPress={onTake} activeOpacity={0.85}>
        <Text style={styles.takeButtonText}>Aldım</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NudgeCard;
