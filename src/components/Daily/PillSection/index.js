import React from 'react';
import { View, Text } from 'react-native';
import { getPillStatus, SECTION_TIME_RANGES } from '../../../common/dailyHelpers';
import { useTheme } from '../../../common/ThemeContext';
import AnimatedReveal from '../../shared/AnimatedReveal';
import MedCard from '../MedCard';
import styles from './styles';

const PillSection = ({
  section,
  selectedDate,
  intakeMap,
  onTake,
  onSkip,
  onSnooze,
  onPressEdit,
  animationKey,
  startIndex = 0,
}) => {
  const { colors } = useTheme();

  return (
    <View>
      <AnimatedReveal index={startIndex} animationKey={animationKey} distance={12}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: section.color }]}>
            {section.title}
          </Text>
          {SECTION_TIME_RANGES[section.id] && (
            <Text style={[styles.sectionTimeRange, { color: colors.textMuted }]}>
              {SECTION_TIME_RANGES[section.id]}
            </Text>
          )}
        </View>
      </AnimatedReveal>

      {section.items.map((item, index) => (
        <AnimatedReveal
          key={item.id}
          index={startIndex + index + 1}
          animationKey={animationKey}
        >
          <MedCard
            item={item}
            statusInfo={getPillStatus(item, selectedDate, intakeMap)}
            onTake={onTake}
            onSkip={onSkip}
            onSnooze={onSnooze}
            onPressEdit={onPressEdit}
          />
        </AnimatedReveal>
      ))}
    </View>
  );
};

export default PillSection;
