import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { PROFILE_PRESETS, DEFAULT_PROFILE_ID } from '../../../common/ProfileStorage';
import { useProfile } from '../../../common/ProfileContext';
import styles, { COLORS } from './styles';

const FamilySection = () => {
  const { profiles, activeProfileId, switchProfile, createProfile, removeProfile } =
    useProfile();
  const [customName, setCustomName] = useState('');

  const unusedPresets = PROFILE_PRESETS.filter(
    preset =>
      preset.id !== DEFAULT_PROFILE_ID &&
      !profiles.some(profile => profile.id === preset.id),
  );

  const addCustom = async () => {
    if (!customName.trim()) {
      return;
    }

    await createProfile({ name: customName.trim(), icon: 'account-group' });
    setCustomName('');
  };

  return (
    <View style={styles.wrap}>
      {profiles.map(profile => {
        const active = profile.id === activeProfileId;

        return (
          <View key={profile.id} style={[styles.row, active && styles.rowActive]}>
            <TouchableOpacity
              style={styles.rowMain}
              onPress={() => switchProfile(profile.id)}
            >
              <MaterialCommunityIcons
                name={profile.icon || 'account'}
                size={20}
                color={active ? COLORS.primary : COLORS.text}
              />
              <Text style={[styles.name, active && styles.nameActive]}>
                {profile.name}
              </Text>
              {active ? <Text style={styles.activeLabel}>Aktif</Text> : null}
            </TouchableOpacity>
            {profile.id !== DEFAULT_PROFILE_ID ? (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Profili sil',
                    `${profile.name} profilini silmek istiyor musunuz? İlaçları silinmez, yalnızca profil kalkar.`,
                    [
                      { text: 'Vazgeç', style: 'cancel' },
                      {
                        text: 'Sil',
                        style: 'destructive',
                        onPress: () => removeProfile(profile.id),
                      },
                    ],
                  )
                }
              >
                <MaterialCommunityIcons name="delete-outline" size={20} color="#DC2626" />
              </TouchableOpacity>
            ) : null}
          </View>
        );
      })}

      {unusedPresets.length > 0 ? (
        <View style={styles.presetRow}>
          {unusedPresets.map(preset => (
            <TouchableOpacity
              key={preset.id}
              style={styles.presetChip}
              onPress={() => createProfile(preset)}
            >
              <Text style={styles.presetText}>+ {preset.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Özel profil adı"
          placeholderTextColor={COLORS.textMuted}
          value={customName}
          onChangeText={setCustomName}
        />
        <TouchableOpacity style={styles.addButton} onPress={addCustom}>
          <Text style={styles.addButtonText}>Ekle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FamilySection;
