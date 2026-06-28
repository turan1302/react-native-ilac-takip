import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import useNotificationBadge from '../../hooks/useNotificationBadge';
import styles from './styles';

const NotificationBell = ({
  size = 20,
  color = '#6B7280',
  buttonStyle,
}) => {
  const navigation = useNavigation();
  const { badgeCount } = useNotificationBadge();

  const handlePress = () => {
    navigation.getParent()?.getParent()?.navigate('Notifications');
  };

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Feather name="bell" size={size} color={color} />
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationBell;
