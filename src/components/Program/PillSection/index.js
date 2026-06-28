import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MedCard from '../MedCard';
import styles from './styles';

const PillSection = ({ section, onToggleTaken, onPressEdit }) => (
  <View>
    <View style={styles.sectionHeader}>
      <Feather name={section.icon} size={14} color={section.color} />
      <Text style={[styles.sectionTitle, { color: section.color }]}>
        {section.title}
      </Text>
    </View>

    {section.items.map(item => (
      <MedCard
        key={item.id}
        item={item}
        onToggleTaken={onToggleTaken}
        onPressEdit={onPressEdit}
      />
    ))}
  </View>
);

export default PillSection;
