import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const CaregiverCard = ({ rows = [], onShare, onDismiss }) => {
  const { colors, isDark } = useTheme();

  if (!rows.length) {
    return null;
  }

  const title =
    rows.length === 1
      ? `${rows[0].profileName}: ${rows[0].missed} doz kaçtı`
      : `${rows.length} aile profilinde kaçırılan doz var`;

  return (
    <View
      style={[
        styles.card,
        isDark && {
          backgroundColor: '#451A03',
          borderColor: colors.warning,
        },
      ]}
    >
      <View style={[styles.iconWrap, isDark && { backgroundColor: colors.card }]}>
        <Feather name="users" size={18} color={colors.warning} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.kicker, isDark && { color: colors.warning }]}>
          Bakıcı özeti
        </Text>
        <Text style={[styles.title, isDark && { color: colors.text }]}>
          {title}
        </Text>
        {rows.map(row => (
          <Text
            key={row.profileId}
            style={[styles.subtitle, isDark && { color: colors.textSecondary }]}
          >
            {row.profileName}: {row.missed} doz
          </Text>
        ))}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: colors.primary }]}
          onPress={onShare}
        >
          <Text style={styles.shareText}>Paylaş</Text>
        </TouchableOpacity>
        {onDismiss ? (
          <TouchableOpacity onPress={onDismiss}>
            <Feather name="x" size={18} color={colors.warning} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default CaregiverCard;
