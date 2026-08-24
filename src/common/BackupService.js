import { Share, Platform } from 'react-native';
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
} from './storage/keys';
import { parseJson, stringifyJson } from './storage/json';
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
  SCHEMA_VERSION_KEY,
];

const extractJsonText = text => {
  const index = (text || '').indexOf(JSON_MARKER);

  if (index >= 0) {
    return text.slice(index + JSON_MARKER.length).trim();
  }

  return (text || '').trim();
};

const formatReadableReport = (pills, reports) => {
  const pillLines = (pills || []).map(pill => {
    const time = pill.time ? ` • ${pill.time}` : '';
    return `• ${pill.name || 'İlaç'}${time} (${pill.frequency || 'Her Gün'})`;
  });

  const takenCount = (reports || []).filter(
    report => report.status === 'taken' || report.taken,
  ).length;

  return [
    'İlaç Takibi yedeği',
    `Tarih: ${new Date().toLocaleString('tr-TR')}`,
    '',
    `İlaç sayısı: ${pillLines.length}`,
    `Alım kaydı: ${(reports || []).length} (alınan: ${takenCount})`,
    '',
    'İlaçlar:',
    ...(pillLines.length ? pillLines : ['• Kayıt yok']),
  ].join('\n');
};

export const buildBackupPayload = async () => {
  const pairs = await AsyncStorage.multiGet(MANAGED_STORAGE_KEYS);
  const data = {};

  pairs.forEach(([key, value]) => {
    if (value != null) {
      data[key] = value;
    }
  });

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
};

export const shareBackup = async () => {
  const payload = await buildBackupPayload();
  const pills = parseJson(payload.data[PILLS_STORAGE_KEY], []);
  const reports = parseJson(payload.data[INTAKE_REPORTS_KEY], []);
  const readable = formatReadableReport(pills, reports);
  const message = `${readable}\n\n${JSON_MARKER}\n${stringifyJson(payload)}`;

  const result = await Share.share(
    Platform.OS === 'ios'
      ? { title: 'İlaç Takibi Yedeği', message }
      : { title: 'İlaç Takibi Yedeği', message, subject: 'İlaç Takibi Yedeği' },
  );

  return result;
};

export const parseBackupText = text => {
  const parsed = parseJson(extractJsonText(text), null);

  if (!parsed || parsed.app !== BACKUP_APP_ID || !parsed.data) {
    throw new Error('Geçersiz yedek dosyası');
  }

  return parsed;
};

export const restoreBackup = async text => {
  const payload = parseBackupText(text);
  const entries = RESTORE_KEYS.map(key => {
    const value = payload.data[key];
    return value == null ? null : [key, value];
  }).filter(Boolean);

  if (payload.schemaVersion != null && !payload.data[SCHEMA_VERSION_KEY]) {
    entries.push([SCHEMA_VERSION_KEY, String(payload.schemaVersion)]);
  }

  if (entries.length) {
    await AsyncStorage.multiSet(entries);
  }

  return payload;
};
