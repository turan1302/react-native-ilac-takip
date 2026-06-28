import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles, { COLORS } from './styles';

const NotificationCard = ({ item, onTake, onDismiss, onPressEdit }) => (
  <View style={[styles.card, item.dismissed && styles.cardDismissed]}>
    <TouchableOpacity
      style={styles.cardPressable}
      onPress={() => onPressEdit(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.cardAccent,
          item.dismissed && styles.cardAccentDismissed,
        ]}
      />
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDetail}>
          {item.time} • {item.dosage}
        </Text>
      </View>
    </TouchableOpacity>

    <View style={styles.cardActions}>
      {item.dismissed ? (
        <Text style={styles.dismissedLabel}>Pas geçildi</Text>
      ) : null}
      <TouchableOpacity
        style={styles.takeButton}
        onPress={() => onTake(item)}
        activeOpacity={0.85}
      >
        <Text style={styles.takeButtonText}>Al</Text>
      </TouchableOpacity>
      {!item.dismissed && (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => onDismiss(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.dismissButtonText}>Pas Geç</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default NotificationCard;
