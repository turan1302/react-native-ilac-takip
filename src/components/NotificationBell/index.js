import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../common/ThemeContext';
import useNotificationBadge from '../../hooks/useNotificationBadge';
import styles from './styles';

const NotificationBell = ({ size = 20, color, buttonStyle }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { badgeCount } = useNotificationBadge();
  const iconColor = color || colors.textSecondary;

  const handlePress = () => {
    navigation.getParent()?.getParent()?.navigate('Notifications');
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        buttonStyle,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Feather name="bell" size={size} color={iconColor} />
      {badgeCount > 0 && (
        <View style={[styles.badge, { borderColor: colors.card }]}>
          <Text style={styles.badgeText}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationBell;
