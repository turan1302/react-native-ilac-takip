import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { PROFILE_PRESETS, DEFAULT_PROFILE_ID } from '../../../common/ProfileStorage';
import { useProfile } from '../../../common/ProfileContext';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const FamilySection = () => {
  const { profiles, activeProfileId, switchProfile, createProfile, removeProfile } =
    useProfile();
  const { colors, isDark } = useTheme();
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

  const confirmRemove = profile => {
    Alert.alert(
      'Profili sil',
      `${profile.name} profilini silmek istiyor musunuz? İlaçları silinmez, yalnızca profil kalkar`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => removeProfile(profile.id),
        },
      ],
    );
  };

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[styles.headerIcon, { backgroundColor: colors.primarySoft }]}
        >
          <Feather name="users" size={18} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Profiller
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Aile üyeleri için ayrı ilaç listesi tutun
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {profiles.map(profile => {
          const active = profile.id === activeProfileId;
          const canDelete = profile.id !== DEFAULT_PROFILE_ID;

          return (
            <View
              key={profile.id}
              style={[
                styles.profileRow,
                {
                  backgroundColor: active
                    ? colors.primarySoft
                    : isDark
                      ? colors.background
                      : '#F8FAFC',
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.profileMain}
                onPress={() => switchProfile(profile.id)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: active
                        ? colors.card
                        : colors.primarySoft,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={profile.icon || 'account'}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.profileMeta}>
                  <Text
                    style={[
                      styles.name,
                      { color: active ? colors.primary : colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {profile.name}
                  </Text>
                  {active ? (
                    <View
                      style={[styles.badge, { backgroundColor: colors.card }]}
                    >
                      <Text style={[styles.badgeText, { color: colors.primary }]}>
                        Aktif
                      </Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>

              {canDelete ? (
                <TouchableOpacity
                  style={[
                    styles.deleteBtn,
                    {
                      backgroundColor: isDark
                        ? colors.skippedBadgeBg
                        : '#FEE2E2',
                    },
                  ]}
                  onPress={() => confirmRemove(profile)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <MaterialCommunityIcons
                    name="delete-outline"
                    size={18}
                    color={colors.danger}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })}
      </View>

      {unusedPresets.length > 0 ? (
        <>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            HIZLI EKLE
          </Text>
          <View style={styles.presetRow}>
            {unusedPresets.map(preset => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: isDark
                      ? colors.background
                      : colors.primarySoft,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => createProfile(preset)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={preset.icon || 'account-plus'}
                  size={16}
                  color={colors.primary}
                />
                <Text style={[styles.presetText, { color: colors.primary }]}>
                  {preset.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : null}

      <View
        style={[
          styles.addPanel,
          {
            backgroundColor: isDark ? colors.background : '#F8FAFC',
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 0 }]}>
          ÖZEL PROFİL
        </Text>
        <View style={styles.addRow}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Örn. Dedem, Kardeşim"
            placeholderTextColor={colors.textMuted}
            value={customName}
            onChangeText={setCustomName}
            returnKeyType="done"
            onSubmitEditing={addCustom}
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: customName.trim()
                  ? colors.primary
                  : colors.border,
              },
            ]}
            onPress={addCustom}
            activeOpacity={0.85}
            disabled={!customName.trim()}
          >
            <Text style={styles.addButtonText}>Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FamilySection;
