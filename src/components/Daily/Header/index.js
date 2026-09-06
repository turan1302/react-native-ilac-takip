import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../common/ThemeContext';
import ProfileSwitcher from '../../shared/ProfileSwitcher';
import styles from './styles';

const Header = ({ searchVisible, onToggleSearch, onShareWeekly }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <View
          style={[styles.headerPillIcon, { backgroundColor: colors.primary }]}
        >
          <MaterialCommunityIcons name="pill" size={16} color="#FFFFFF" />
        </View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          <Text style={[styles.headerTitleAccent, { color: colors.primary }]}>
            İlaç{' '}
          </Text>
          Takibi
        </Text>
      </View>
      <View style={styles.headerActions}>
        <ProfileSwitcher />
        {onShareWeekly ? (
          <TouchableOpacity
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={onShareWeekly}
            activeOpacity={0.7}
          >
            <Feather name="share-2" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[
            styles.iconButton,
            {
              backgroundColor: searchVisible ? colors.primarySoft : colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={onToggleSearch}
          activeOpacity={0.7}
        >
          <Feather
            name={searchVisible ? 'x' : 'search'}
            size={20}
            color={searchVisible ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
