import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { formatDateLabel } from '../../../common/pillHelpers';
import { getTodayDateKey } from '../../../common/IntakeStorage';
import { useTheme } from '../../../common/ThemeContext';
import ProgressRing from '../ProgressRing';
import styles from './styles';

const DAY_NAMES_FULL = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
];

const formatTodaySubtitle = () => {
  const today = new Date();
  const dateLabel = formatDateLabel(getTodayDateKey());
  const dayName = DAY_NAMES_FULL[today.getDay()];
  return `${dateLabel.split(' ').slice(0, 2).join(' ')} ${dayName}`;
};

const getHighlightText = progressPercent => {
  if (progressPercent >= 100) {
    return 'Tebrikler, tamamlandı!';
  }

  if (progressPercent >= 50) {
    return 'Harika Gidiyorsun!';
  }

  return 'Devam edin!';
};

const TodaySummary = ({ progressPercent, takenCount, totalCount }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.summaryCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.summaryTop}>
        <View>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Bugün</Text>
          <Text style={[styles.summaryDate, { color: colors.textSecondary }]}>
            {formatTodaySubtitle()}
          </Text>
        </View>
        <ProgressRing percent={progressPercent} />
      </View>

      <View
        style={[styles.summaryBanner, { backgroundColor: colors.primarySoft }]}
      >
        <View style={[styles.summaryBannerIcon, { backgroundColor: colors.card }]}>
          <Feather name="check-circle" size={18} color={colors.primary} />
        </View>
        <View style={styles.summaryBannerTextWrap}>
          <Text style={[styles.summaryBannerText, { color: colors.text }]}>
            {totalCount > 0
              ? `${totalCount} dozdan ${takenCount}'ü alındı`
              : 'Bugün için planlanmış ilaç yok'}
          </Text>
          <Text
            style={[styles.summaryBannerHighlight, { color: colors.primary }]}
          >
            {getHighlightText(progressPercent)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TodaySummary;
