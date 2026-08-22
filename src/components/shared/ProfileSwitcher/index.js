import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useProfile } from '../../../common/ProfileContext';
import styles, { COLORS } from './styles';

const ProfileSwitcher = () => {
  const { profiles, activeProfile, switchProfile } = useProfile();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={activeProfile?.icon || 'account'}
          size={16}
          color={COLORS.primary}
        />
        <Text style={styles.buttonText} numberOfLines={1}>
          {activeProfile?.name || 'Ben'}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.sheet}>
            <Text style={styles.title}>Kimin ilaçları?</Text>
            <ScrollView>
              {profiles.map(profile => {
                const active = profile.id === activeProfile?.id;

                return (
                  <TouchableOpacity
                    key={profile.id}
                    style={[styles.row, active && styles.rowActive]}
                    onPress={async () => {
                      await switchProfile(profile.id);
                      setVisible(false);
                    }}
                  >
                    <MaterialCommunityIcons
                      name={profile.icon || 'account'}
                      size={20}
                      color={active ? COLORS.primary : COLORS.text}
                    />
                    <Text style={[styles.rowText, active && styles.rowTextActive]}>
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
