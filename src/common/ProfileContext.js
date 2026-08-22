import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_PROFILE_ID,
  addProfile,
  deleteProfile,
  getActiveProfileId,
  getProfiles,
  setActiveProfileId,
} from './ProfileStorage';
import { migrateAppStorage } from './storage/migrateStorage';

const ProfileContext = createContext({
  profiles: [],
  activeProfileId: DEFAULT_PROFILE_ID,
  activeProfile: null,
  switchProfile: async () => {},
  createProfile: async () => {},
  removeProfile: async () => {},
  refreshProfiles: async () => {},
});

export const ProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveId] = useState(DEFAULT_PROFILE_ID);

  const refreshProfiles = async () => {
    const [nextProfiles, nextActive] = await Promise.all([
      getProfiles(),
      getActiveProfileId(),
    ]);
    setProfiles(nextProfiles);
    setActiveId(nextActive);
  };

  useEffect(() => {
    migrateAppStorage().then(refreshProfiles);
  }, []);

  const switchProfile = async profileId => {
    await setActiveProfileId(profileId);
    setActiveId(profileId);
  };

  const createProfile = async profile => {
    await addProfile(profile);
    await refreshProfiles();
  };

  const removeProfile = async profileId => {
    await deleteProfile(profileId);
    await refreshProfiles();
  };

  const activeProfile =
    profiles.find(profile => profile.id === activeProfileId) || profiles[0];

  const value = useMemo(
    () => ({
      profiles,
      activeProfileId,
      activeProfile,
      switchProfile,
      createProfile,
      removeProfile,
      refreshProfiles,
    }),
    [profiles, activeProfileId, activeProfile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
