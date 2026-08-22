import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ACTIVE_PROFILE_KEY,
  INTAKE_REPORTS_KEY,
  PILLS_STORAGE_KEY,
  PROFILES_KEY,
} from './keys';
import { parseJson, stringifyJson } from './json';
import { DEFAULT_PROFILE_ID, PROFILE_PRESETS } from '../ProfileStorage';
import { normalizePill } from '../PillStorage';

// Yeni sürümde şema değişince buraya version: 2, 3, ... ekle.
// Eski anahtarlar silinmez; bozuk JSON olduğu gibi bırakılır.

const readArray = async (key, fallback = null) => {
  const raw = await AsyncStorage.getItem(key);

  if (raw == null) {
    return fallback;
  }

  const parsed = parseJson(raw, null);
  return Array.isArray(parsed) ? parsed : fallback;
};

const writeJson = async (key, value) => {
  await AsyncStorage.setItem(key, stringifyJson(value));
};

const ensureFamilyProfiles = async () => {
  const raw = await AsyncStorage.getItem(PROFILES_KEY);
  const parsed = parseJson(raw, null);
  const defaultProfile = PROFILE_PRESETS[0];

  if (!Array.isArray(parsed) || parsed.length === 0) {
    await writeJson(PROFILES_KEY, [defaultProfile]);
  } else if (!parsed.some(profile => profile?.id === DEFAULT_PROFILE_ID)) {
    await writeJson(PROFILES_KEY, [defaultProfile, ...parsed]);
  }

  const activeId = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);

  if (!activeId) {
    await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, DEFAULT_PROFILE_ID);
  }
};

const migratePillsToFamily = async () => {
  const pills = await readArray(PILLS_STORAGE_KEY, null);

  if (!pills) {
    return;
  }

  const nextPills = pills.filter(Boolean).map(pill =>
    normalizePill({
      ...pill,
      profileId: pill.profileId || DEFAULT_PROFILE_ID,
    }),
  );

  await writeJson(PILLS_STORAGE_KEY, nextPills);
};

const migrateIntakeReports = async () => {
  const reports = await readArray(INTAKE_REPORTS_KEY, null);

  if (!reports) {
    return;
  }

  const nextReports = reports.map(report => {
    const scheduledTime = report.scheduledTime || '';
    const status =
      report.status || (report.taken ? 'taken' : report.status || null);

    return {
      ...report,
      scheduledTime,
      status,
      taken: status === 'taken' || report.taken === true,
    };
  });

  await writeJson(INTAKE_REPORTS_KEY, nextReports);
};

export const CURRENT_SCHEMA_VERSION = 1;

export const MIGRATIONS = [
  {
    version: 1,
    name: 'family-profiles',
    migrate: async () => {
      await migratePillsToFamily();
      await ensureFamilyProfiles();
      await migrateIntakeReports();
    },
  },
];
