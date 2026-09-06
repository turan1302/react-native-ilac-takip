import { getPills } from './PillStorage';
import { getProfiles, DEFAULT_PROFILE_ID } from './ProfileStorage';
import { getIntakeMapForDate, getTodayDateKey } from './IntakeStorage';
import { buildPillSections } from './pillHelpers';
import { getAllTravelShifts } from './TravelShiftStorage';
import { getDoseDisplayTime } from './scheduleAdjustments';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CAREGIVER_ALERTS_KEY } from './storage/keys';
import { NativeModules, Share, Platform } from 'react-native';

const COLORS = {};

const isPast = (timeStr, dateKey, now = new Date()) => {
  const today = getTodayDateKey(now);
  if (dateKey < today) {
    return true;
  }
  if (dateKey > today || !timeStr) {
    return false;
  }
  const [hour, minute] = timeStr.split(':').map(Number);
  return (
    now.getHours() > hour ||
    (now.getHours() === hour && now.getMinutes() >= minute)
  );
};

export const getMissedCountForProfile = async (
  profileId,
  dateKey = getTodayDateKey(),
) => {
  const [pills, travelShifts, intakeMap] = await Promise.all([
    getPills(),
    getAllTravelShifts(),
    getIntakeMapForDate(dateKey),
  ]);
  const profilePills = pills.filter(
    pill => (pill.profileId || DEFAULT_PROFILE_ID) === profileId,
  );
  const takenIds = new Set(
    [...intakeMap.entries()]
      .filter(([, report]) => report.taken || report.status === 'taken')
      .map(([key]) => key),
  );
  const { sections } = buildPillSections(
    profilePills,
    COLORS,
    takenIds,
    dateKey,
    travelShifts,
  );
  const items = sections.flatMap(section => section.items || []);

  return items.filter(item => {
    if (item.isTaken || item.asNeeded) {
      return false;
    }
    const report = intakeMap.get(item.id);
    if (report?.status === 'skipped' || report?.status === 'missed') {
      return true;
    }
    return isPast(getDoseDisplayTime(item), dateKey);
  }).length;
};

export const getCaregiverSummaries = async (dateKey = getTodayDateKey()) => {
  const profiles = await getProfiles();
  const rows = [];

  for (const profile of profiles) {
    if (profile.id === DEFAULT_PROFILE_ID) {
      continue;
    }
    const missed = await getMissedCountForProfile(profile.id, dateKey);
    if (missed >= 2) {
      rows.push({
        profileId: profile.id,
        profileName: profile.name,
        missed,
        dateKey,
      });
    }
  }

  return rows;
};

export const buildCaregiverSummaryText = async (
  dateKey = getTodayDateKey(),
) => {
  const rows = await getCaregiverSummaries(dateKey);
  if (!rows.length) {
    return 'Bugün aile profillerinde 2 veya daha fazla kaçırılan doz yok';
  }

  const lines = rows.map(
    row => `• ${row.profileName}: ${row.missed} doz kaçırıldı`,
  );

  return [
    'İlaç Takibi — bakıcı özeti',
    `Tarih: ${dateKey}`,
    '',
    ...lines,
    '',
    'Lütfen kontrol edin veya hatırlatın',
  ].join('\n');
};

export const shareCaregiverSummary = async (dateKey = getTodayDateKey()) => {
  const message = await buildCaregiverSummaryText(dateKey);
  const native = NativeModules.NextDoseWidget;

  if (native?.shareJsonFile) {
    try {
      await native.shareJsonFile(
        message,
        `ilac-takibi-bakici-${dateKey}.txt`,
      );
      return { action: 'shared' };
    } catch (error) {
      // fall through
    }
  }

  return Share.share(
    Platform.OS === 'ios'
      ? { title: 'Bakıcı özeti', message }
      : { title: 'Bakıcı özeti', message, subject: 'Bakıcı özeti' },
  );
};

export const getCaregiverDismissKey = (dateKey, profileId) =>
  `${dateKey}_${profileId}`;

export const getDismissedCaregiverKeys = async () => {
  const raw = await AsyncStorage.getItem(CAREGIVER_ALERTS_KEY);
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    return new Set();
  }
};

export const dismissCaregiverAlert = async (dateKey, profileId) => {
  const set = await getDismissedCaregiverKeys();
  set.add(getCaregiverDismissKey(dateKey, profileId));
  await AsyncStorage.setItem(
    CAREGIVER_ALERTS_KEY,
    JSON.stringify([...set]),
  );
};
