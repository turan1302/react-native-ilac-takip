import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles, { COLORS } from './styles';

const ReminderToggle = ({ enabled, onToggle }) => (
  <View style={styles.reminderCard}>
    <View style={styles.reminderIconWrapper}>
      <Feather name="bell" size={20} color={COLORS.reminderIcon} />
    </View>
    <View style={styles.reminderTextWrapper}>
      <Text style={styles.reminderTitle}>Hatırlatıcılar</Text>
      <Text style={styles.reminderSubtitle}>
        {enabled ? 'Tüm bildirimler açık' : 'Tüm bildirimler kapalı'}
      </Text>
    </View>
    <TouchableOpacity
      style={[styles.switchTrack, !enabled && styles.switchTrackOff]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View
        style={[styles.switchThumb, !enabled && styles.switchThumbOff]}
      />
    </TouchableOpacity>
  </View>
);

export default ReminderToggle;
