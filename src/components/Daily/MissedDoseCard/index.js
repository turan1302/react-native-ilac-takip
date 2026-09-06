import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const MissedDoseCard = ({ missed = 0, onShare }) => {
  const { colors, isDark } = useTheme();
  const hasMissed = missed > 0;
  const title = hasMissed
    ? `Bu hafta ${missed} doz kaçtı`
    : 'Bu hafta doz kaçırmadınız';
  const subtitle = hasMissed
    ? 'Kaçırılan dozları Günlük listesinden işaretleyebilirsiniz'
    : 'Uyumunuz iyi gidiyor, böyle devam edin';
  const accent = hasMissed ? colors.warning : colors.success;

  return (
    <View
      style={[
        styles.card,
        hasMissed ? styles.cardWarn : styles.cardOk,
        isDark && {
          backgroundColor: hasMissed ? '#451A03' : '#064E3B',
          borderColor: accent,
        },
      ]}
    >
      <Feather
        name={hasMissed ? 'alert-circle' : 'check-circle'}
        size={18}
        color={accent}
      />
      <View style={styles.textWrap}>
        <Text
          style={[
            styles.title,
            hasMissed ? styles.titleWarn : styles.titleOk,
            isDark && { color: accent },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.subtitle,
            hasMissed ? styles.subWarn : styles.subOk,
            isDark && { color: colors.textSecondary },
          ]}
        >
          {subtitle}
        </Text>
      </View>
      {onShare ? (
        <TouchableOpacity
          onPress={onShare}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Haftalık özeti paylaş"
        >
          <Feather name="share-2" size={16} color={accent} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default MissedDoseCard;
