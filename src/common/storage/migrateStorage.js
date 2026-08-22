import AsyncStorage from '@react-native-async-storage/async-storage';
import { SCHEMA_VERSION_KEY, STORAGE_BACKUP_KEY } from './keys';
import { parseJson, stringifyJson } from './json';
import { CURRENT_SCHEMA_VERSION, MIGRATIONS } from './migrations';

let migratePromise = null;

const getStoredSchemaVersion = async () => {
  const raw = await AsyncStorage.getItem(SCHEMA_VERSION_KEY);
  const version = Number(raw);

  if (Number.isFinite(version) && version >= 0) {
    return version;
  }

  return 0;
};

const snapshotStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const persistableKeys = keys.filter(key => key !== STORAGE_BACKUP_KEY);

  if (persistableKeys.length === 0) {
    return {};
  }

  const pairs = await AsyncStorage.multiGet(persistableKeys);
  return Object.fromEntries(pairs.filter(([, value]) => value != null));
};

const restoreSnapshot = async snapshot => {
  const entries = Object.entries(snapshot || {});

  if (entries.length === 0) {
    return;
  }

  await AsyncStorage.multiSet(entries);
};

const runPendingMigrations = async () => {
  const fromVersion = await getStoredSchemaVersion();

  if (fromVersion >= CURRENT_SCHEMA_VERSION) {
    return { fromVersion, toVersion: fromVersion, migrated: false };
  }

  const pending = MIGRATIONS.filter(
    migration => migration.version > fromVersion,
  ).sort((left, right) => left.version - right.version);

  const snapshot = await snapshotStorage();
  await AsyncStorage.setItem(STORAGE_BACKUP_KEY, stringifyJson(snapshot));

  try {
    for (const migration of pending) {
      await migration.migrate();
      await AsyncStorage.setItem(SCHEMA_VERSION_KEY, String(migration.version));
    }

    return {
      fromVersion,
      toVersion: CURRENT_SCHEMA_VERSION,
      migrated: true,
    };
  } catch (error) {
    console.warn('Storage migration failed, restoring snapshot:', error);
    await restoreSnapshot(snapshot);
    throw error;
  }
};

export const migrateAppStorage = () => {
  if (!migratePromise) {
    migratePromise = runPendingMigrations().catch(error => {
      migratePromise = null;
      console.warn('migrateAppStorage:', error);
      return { fromVersion: 0, toVersion: 0, migrated: false, error };
    });
  }

  return migratePromise;
};

export const getAppSchemaVersion = getStoredSchemaVersion;

export const peekStorageBackup = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_BACKUP_KEY);
  return parseJson(raw, null);
};
