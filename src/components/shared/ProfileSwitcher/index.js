import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useProfile } from '../../../common/ProfileContext';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const ProfileSwitcher = () => {
  const { profiles, activeProfile, switchProfile } = useProfile();
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={activeProfile?.icon || 'account'}
          size={16}
          color={colors.primary}
        />
        <Text style={[styles.buttonText, { color: colors.text }]} numberOfLines={1}>
          {activeProfile?.name || 'Ben'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.title, { color: colors.text }]}>
              Kimin ilaçları?
            </Text>
            <ScrollView>
              {profiles.map(profile => {
                const active = profile.id === activeProfile?.id;

                return (
                  <TouchableOpacity
                    key={profile.id}
                    style={[
                      styles.row,
                      active && {
                        backgroundColor: colors.primarySoft,
                      },
                    ]}
                    onPress={async () => {
                      await switchProfile(profile.id);
                      setVisible(false);
                    }}
                  >
                    <MaterialCommunityIcons
                      name={profile.icon || 'account'}
                      size={20}
                      color={active ? colors.primary : colors.text}
                    />
                    <Text
                      style={[
                        styles.rowText,
                        { color: active ? colors.primary : colors.text },
                      ]}
                    >
                      {profile.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default ProfileSwitcher;
