import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles from './styles';

const MissedDoseCard = ({ missed = 0, onShare }) => {
  const hasMissed = missed > 0;
  const title = hasMissed
    ? `Bu hafta ${missed} doz kaçtı`
    : 'Bu hafta doz kaçırmadınız';
  const subtitle = hasMissed
    ? 'Kaçırılan dozları Günlük listesinden işaretleyebilirsiniz.'
    : 'Uyumunuz iyi gidiyor, böyle devam edin.';

  return (
    <View style={[styles.card, hasMissed ? styles.cardWarn : styles.cardOk]}>
      <Feather
        name={hasMissed ? 'alert-circle' : 'check-circle'}
        size={18}
        color={hasMissed ? '#B45309' : '#047857'}
      />
      <View style={styles.textWrap}>
        <Text style={[styles.title, hasMissed ? styles.titleWarn : styles.titleOk]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, hasMissed ? styles.subWarn : styles.subOk]}>
          {subtitle}
        </Text>
      </View>
      {onShare ? (
        <TouchableOpacity
          onPress={onShare}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Haftalık özeti paylaş"
        >
          <Feather
            name="share-2"
            size={16}
            color={hasMissed ? '#B45309' : '#047857'}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default MissedDoseCard;
