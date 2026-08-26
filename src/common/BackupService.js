import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ACTIVE_PROFILE_KEY,
  IN_APP_DISMISSALS_KEY,
  INTAKE_REPORTS_KEY,
  MANAGED_STORAGE_KEYS,
  ONBOARD_SHOW_KEY,
  PILLS_STORAGE_KEY,
  PROFILES_KEY,
  QUIET_HOURS_ENABLED_KEY,
  QUIET_HOURS_END_KEY,
  QUIET_HOURS_START_KEY,
  REMINDERS_ENABLED_KEY,
  SCHEMA_VERSION_KEY,
  SYMPTOM_DIARY_KEY,
} from './storage/keys';
import { parseJson } from './storage/json';
import { CURRENT_SCHEMA_VERSION } from './storage/migrations';

const BACKUP_APP_ID = 'ilacTakip';
const JSON_MARKER = '---JSON---';

const RESTORE_KEYS = [
  PILLS_STORAGE_KEY,
  INTAKE_REPORTS_KEY,
  IN_APP_DISMISSALS_KEY,
  REMINDERS_ENABLED_KEY,
  PROFILES_KEY,
  ACTIVE_PROFILE_KEY,
  ONBOARD_SHOW_KEY,
  QUIET_HOURS_ENABLED_KEY,
  QUIET_HOURS_START_KEY,
  QUIET_HOURS_END_KEY,
  SYMPTOM_DIARY_KEY,
  SCHEMA_VERSION_KEY,
];

const asRecord = value =>
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.prototype.toString.call(value) === '[object Object]'
    ? value
    : null;

const stripBom = text => String(text || '').replace(/^\uFEFF/, '');

const sanitizeBackupText = text =>
  stripBom(text)
    .replace(/[\u0000\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2028\u2029]/g, '\n')
    .replace(/[\u201C\u201D\u201E\u00AB\u00BB]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .trim();

const extractJsonText = text => {
  const cleaned = sanitizeBackupText(text);

  const marked = cleaned.indexOf(JSON_MARKER);
  const source = marked >= 0 ? cleaned.slice(marked + JSON_MARKER.length).trim() : cleaned;
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');

  if (start >= 0 && end > start) {
    return source.slice(start, end + 1);
  }

  const arrayStart = source.indexOf('[');
  const arrayEnd = source.lastIndexOf(']');
  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    return source.slice(arrayStart, arrayEnd + 1);
  }

  return source;
};

const repairJson = text =>
  String(text || '')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/:\s*undefined\b/g, ': null');

const tryJsonParse = text => {
  const raw = extractJsonText(text);
  if (!raw) {
    return null;
  }

  const attempts = [raw, repairJson(raw)];
  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt);
    } catch (error) {
      // keep trying
    }
  }

  const marker = raw.search(/"app"\s*:\s*"ilacTakip/i);
  if (marker >= 0) {
    const start = raw.lastIndexOf('{', marker);
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(repairJson(raw.slice(start, end + 1)));
      } catch (error) {
        return null;
      }
    }
  }

  return null;
};

export const buildBackupPayload = async () => {
  const data = {};

  for (const key of MANAGED_STORAGE_KEYS) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value != null && value !== '') {
        data[key] = value;
      }
    } catch (error) {
      console.warn('backup key failed:', key, error);
    }
  }

  try {
    const schemaVersion = await AsyncStorage.getItem(SCHEMA_VERSION_KEY);
    if (schemaVersion != null) {
      data[SCHEMA_VERSION_KEY] = schemaVersion;
    }

    return {
      app: BACKUP_APP_ID,
      schemaVersion: Number(schemaVersion) || CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data,
    };
  } catch (error) {
    return {
      app: BACKUP_APP_ID,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data,
    };
  }
};

const nativeBackup = () => NativeModules.NextDoseWidget;

const isCancelled = error => {
  const text = `${error?.code || ''} ${error?.message || ''}`.toLowerCase();
  return text.includes('cancel');
};

export const getBackupJson = async () => {
  const payload = await buildBackupPayload();
  const data = {};

  Object.keys(payload.data || {}).forEach(key => {
    const value = payload.data[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        data[key] = parseJson(trimmed, value);
        return;
      }
    }
    data[key] = value;
  });

  const filePayload = {
    app: BACKUP_APP_ID,
    schemaVersion: payload.schemaVersion,
    exportedAt: payload.exportedAt,
    data,
  };

  return JSON.stringify(filePayload, null, 2);
};

export const shareBackup = async () => {
  const json = await getBackupJson();
  const native = nativeBackup();

  if (!native?.shareJsonFile) {
    throw new Error('SHARE_UNAVAILABLE');
  }

  try {
    await native.shareJsonFile(json, 'ilac-takibi-yedek.json');
    return { action: 'shared', message: json };
  } catch (error) {
    if (isCancelled(error)) {
      return { action: 'cancelled', message: json };
    }

    throw error;
  }
};

export const pickBackupFile = async () => {
  const native = nativeBackup();

  if (!native?.pickBackupFile) {
    throw new Error('PICK_UNAVAILABLE');
  }

  try {
    const picked = await native.pickBackupFile();
    if (looksLikeBackup(picked)) {
      return picked;
    }

    if (native.readLocalBackupFile) {
      const local = await native.readLocalBackupFile();
      if (looksLikeBackup(local)) {
        return local;
      }
    }

    return typeof picked === 'string' ? picked : null;
  } catch (error) {
    if (isCancelled(error)) {
      return null;
    }

    throw error;
  }
};

export const readLocalBackupFile = async () => {
  const native = nativeBackup();
  if (!native?.readLocalBackupFile) {
    return null;
  }

  try {
    const text = await native.readLocalBackupFile();
    return looksLikeBackup(text) ? text : text || null;
  } catch (error) {
    return null;
  }
};

const looksLikeBackup = value => {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  return trimmed.startsWith('{') || trimmed.startsWith('[');
};

const toStorageString = value => {
  if (value == null) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return null;
  }
};

const unwrapData = record => {
  let data = record?.data;

  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (error) {
      data = tryJsonParse(data);
    }
  }

  if (Array.isArray(data)) {
    return { [PILLS_STORAGE_KEY]: data };
  }

  return asRecord(data) || {};
};

const applyBackupRecord = async record => {
  const data = unwrapData(record);
  const keys = Array.from(new Set([...RESTORE_KEYS, ...MANAGED_STORAGE_KEYS]));

  const entries = [];
  keys.forEach(key => {
    const value = toStorageString(data[key] ?? record[key]);
    if (value != null) {
      entries.push([key, value]);
    }
  });

  if (record.schemaVersion != null && data[SCHEMA_VERSION_KEY] == null) {
    entries.push([SCHEMA_VERSION_KEY, String(record.schemaVersion)]);
  }

  if (!entries.length) {
    throw new Error('EMPTY_BACKUP');
  }

  for (const [key, value] of entries) {
    await AsyncStorage.setItem(key, value);
  }

  return record;
};

const parseToRecord = text => {
  if (asRecord(text)) {
    return text;
  }

  const raw = sanitizeBackupText(String(text ?? ''));
  if (!raw) {
    throw new Error('EMPTY_FILE');
  }

  let parsed = null;
  let lastError = null;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    lastError = error;
    parsed = tryJsonParse(raw);
  }

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(sanitizeBackupText(parsed));
    } catch (error) {
      lastError = error;
      parsed = tryJsonParse(parsed);
    }
  }

  if (Array.isArray(parsed)) {
    return { app: BACKUP_APP_ID, data: { [PILLS_STORAGE_KEY]: parsed } };
  }

  const record = asRecord(parsed);
  if (!record) {
    const hint = lastError?.message ? ` (${lastError.message})` : '';
    throw new Error(`INVALID_BACKUP${hint}`);
  }

  return record;
};

export const parseBackupText = text => parseToRecord(text);

export const restoreBackup = async text => applyBackupRecord(parseToRecord(text));

export const getClipboardBackup = async () => {
  const native = nativeBackup();
  if (!native?.getClipboard) {
    return null;
  }

  try {
    const text = await native.getClipboard();
    return looksLikeBackup(text) ? text : text || null;
  } catch (error) {
    return null;
  }
};

