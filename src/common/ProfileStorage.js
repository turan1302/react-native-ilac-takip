import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVE_PROFILE_KEY, PROFILES_KEY } from './storage/keys';

export const DEFAULT_PROFILE_ID = 'me';
export { PROFILES_KEY, ACTIVE_PROFILE_KEY };

export const PROFILE_PRESETS = [
  { id: 'me', name: 'Ben', icon: 'account' },
  { id: 'mom', name: 'Annem', icon: 'account-heart' },
  { id: 'dad', name: 'Babam', icon: 'account-tie' },
  { id: 'child', name: 'Çocuğum', icon: 'account-child' },
];

const defaultProfiles = () => [PROFILE_PRESETS[0]];

export const getProfiles = async () => {
  const data = await AsyncStorage.getItem(PROFILES_KEY);
  const profiles = data ? JSON.parse(data) : defaultProfiles();

  if (!profiles.some(profile => profile.id === DEFAULT_PROFILE_ID)) {
    return [PROFILE_PRESETS[0], ...profiles];
  }

  return profiles;
};

export const saveProfiles = async profiles => {
  await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

export const getActiveProfileId = async () => {
  return (await AsyncStorage.getItem(ACTIVE_PROFILE_KEY)) || DEFAULT_PROFILE_ID;
};

export const setActiveProfileId = async profileId => {
  await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
};

export const addProfile = async profile => {
  const profiles = await getProfiles();
  const next = {
    id: profile.id || `profile_${Date.now()}`,
    name: profile.name,
    icon: profile.icon || 'account',
  };

  if (profiles.some(item => item.id === next.id)) {
    return next;
  }

  profiles.push(next);
  await saveProfiles(profiles);
  return next;
};

export const deleteProfile = async profileId => {
  if (profileId === DEFAULT_PROFILE_ID) {
    return getProfiles();
  }

  const profiles = (await getProfiles()).filter(item => item.id !== profileId);
  await saveProfiles(profiles);

  const activeId = await getActiveProfileId();

  if (activeId === profileId) {
    await setActiveProfileId(DEFAULT_PROFILE_ID);
  }

  return profiles;
};
