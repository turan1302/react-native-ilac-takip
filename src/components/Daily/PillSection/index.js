import React from 'react';
import { View, Text } from 'react-native';
import { getPillStatus, SECTION_TIME_RANGES } from '../../../common/dailyHelpers';
import MedCard from '../MedCard';
import styles from './styles';

const PillSection = ({
  section,
  selectedDate,
  intakeMap,
  onTake,
  onPressEdit,
}) => (
  <View>
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: section.color }]}>
        {section.title}
      </Text>
      {SECTION_TIME_RANGES[section.id] && (
        <Text style={styles.sectionTimeRange}>
          {SECTION_TIME_RANGES[section.id]}
        </Text>
      )}
    </View>

    {section.items.map(item => (
      <MedCard
        key={item.id}
        item={item}
        statusInfo={getPillStatus(item, selectedDate, intakeMap)}
        onTake={onTake}
        onPressEdit={onPressEdit}
      />
    ))}
  </View>
);

export default PillSection;
