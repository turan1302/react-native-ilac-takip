import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const ReminderToggle = ({ enabled, onToggle }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.reminderCard,
        { backgroundColor: colors.primarySoft, borderColor: colors.border },
      ]}
    >
      <View
        style={[styles.reminderIconWrapper, { backgroundColor: colors.card }]}
      >
        <Feather name="bell" size={20} color={colors.primary} />
      </View>
      <View style={styles.reminderTextWrapper}>
        <Text style={[styles.reminderTitle, { color: colors.text }]}>
          Hatırlatıcılar
        </Text>
        <Text style={[styles.reminderSubtitle, { color: colors.textSecondary }]}>
          {enabled ? 'Tüm bildirimler açık' : 'Tüm bildirimler kapalı'}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.switchTrack,
          { backgroundColor: enabled ? colors.primary : colors.border },
        ]}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.switchThumb,
            { backgroundColor: '#FFFFFF' },
            !enabled && styles.switchThumbOff,
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

export default ReminderToggle;
