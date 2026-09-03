import { NativeModules, Share, Platform } from 'react-native';
import { getIntakeMapForDate, getTodayDateKey } from './IntakeStorage';
import { getDiaryEntries } from './DiaryStorage';
import { getPillsForProfile } from './PillStorage';
import { getActiveProfileId, getProfiles } from './ProfileStorage';
import {
  buildPillSections,
  shiftDateKeyByDays,
} from './pillHelpers';
import { getPillStatus, calculateMonthlyStats } from './dailyHelpers';
import { getAllTravelShifts } from './TravelShiftStorage';
import { getDoseDisplayTime } from './scheduleAdjustments';

const REPORT_COLORS = {};

const nativeShare = () => NativeModules.NextDoseWidget;

const isCancelled = error =>
  /cancel/i.test(String(error?.code || error?.message || ''));

const formatLongDate = dateKey => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatStamp = (value = new Date()) =>
  value.toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const statusLabel = (item, dateKey, intakeMap) => {
  const intake =
    intakeMap.get(item.id) ||
    intakeMap.get(`${item.pill.id}__${item.time || 'asneeded'}`) ||
    intakeMap.get(item.pill.id);
  const { status } = getPillStatus(item, dateKey, intakeMap);

  if (status === 'taken') {
    return 'Alındı';
  }

  if (intake?.status === 'skipped') {
    return 'Atlandı';
  }

  if (status === 'postponed') {
    return 'Ertelendi';
  }

  if (status === 'skipped') {
    return item.asNeeded ? 'Alınmadı' : 'Kaçırıldı';
  }

  return 'Bekliyor';
};

const collectDayItems = async (pills, dateKey, travelShifts = {}) => {
  const intakeMap = await getIntakeMapForDate(dateKey);
  const takenIds = new Set(
    [...intakeMap.entries()]
      .filter(([, report]) => report.taken || report.status === 'taken')
      .map(([key]) => key),
  );
  const { sections, asNeededSection } = buildPillSections(
    pills,
    REPORT_COLORS,
    takenIds,
    dateKey,
    travelShifts,
  );
  const items = [
    ...sections.flatMap(section => section.items),
    ...(asNeededSection?.items || []),
  ];

  return items.map(item => ({
    name: item.name,
    time: getDoseDisplayTime(item) || item.time || '',
    dosage: item.dosage || '',
    asNeeded: Boolean(item.asNeeded),
    status: statusLabel(item, dateKey, intakeMap),
  }));
};

export const shareReportFile = async (contents, filename, title) => {
  const native = nativeShare();

  if (native?.shareJsonFile) {
    try {
      await native.shareJsonFile(contents, filename);
      return { action: 'shared' };
    } catch (error) {
      if (isCancelled(error)) {
        return { action: 'cancelled' };
      }
    }
  }

  const result = await Share.share(
    Platform.OS === 'ios'
      ? { title, message: contents }
      : { title, message: contents, subject: title },
  );

  return {
    action: result.action === Share.dismissedAction ? 'cancelled' : 'shared',
  };
};

export const buildWeeklyAdherenceText = async (endDateKey = getTodayDateKey()) => {
  const profileId = await getActiveProfileId();
  const [pills, profiles, travelShifts] = await Promise.all([
    getPillsForProfile(profileId),
    getProfiles(),
    getAllTravelShifts(),
  ]);
  const profileName =
    profiles.find(profile => profile.id === profileId)?.name || 'Ben';
  const startDateKey = shiftDateKeyByDays(endDateKey, -6);
  const monthly = await calculateMonthlyStats(
    pills,
    endDateKey,
    REPORT_COLORS,
    travelShifts,
  );
  const days = [];
  let taken = 0;
  let missed = 0;
  let skipped = 0;
  let pending = 0;
  let total = 0;

  for (let offset = 6; offset >= 0; offset -= 1) {
    const dateKey = shiftDateKeyByDays(endDateKey, -offset);
    const items = await collectDayItems(pills, dateKey, travelShifts);
    days.push({ dateKey, items });

    items.forEach(item => {
      if (item.asNeeded && item.status !== 'Alındı') {
        return;
      }

      total += 1;

      if (item.status === 'Alındı') {
        taken += 1;
        return;
      }

      if (item.status === 'Atlandı') {
        skipped += 1;
        return;
      }

      if (item.status === 'Bekliyor' || item.status === 'Ertelendi') {
        pending += 1;
        return;
      }

      missed += 1;
    });
  }

  const scheduled = taken + missed + skipped + pending;
  const compliance =
    scheduled > 0 ? Math.round((taken / scheduled) * 100) : 0;

  const dayBlocks = days
    .map(({ dateKey, items }) => {
      const lines = items.length
        ? items.map(item => {
            const when = item.asNeeded ? 'ihtiyaç' : item.time || '--:--';
            return `  • ${item.name}  ${when}  —  ${item.status}`;
          })
        : ['  • Planlı doz yok'];

      return `${formatLongDate(dateKey)}\n${lines.join('\n')}`;
    })
    .join('\n\n');

  return [
    'İlaç Takibi — haftalık uyum özeti',
    `Profil: ${profileName}`,
    `Dönem: ${formatLongDate(startDateKey)} – ${formatLongDate(endDateKey)}`,
    `Oluşturulma: ${formatStamp()}`,
    '',
    `Alındı: ${taken}`,
    `Kaçırıldı: ${missed}`,
    skipped ? `Atlandı: ${skipped}` : null,
    pending ? `Bekliyor / ertelendi: ${pending}` : null,
    `Toplam planlı doz: ${total}`,
    `Uyum: %${compliance}`,
    '',
    `Son 30 gün: alındı ${monthly.taken} / kaçırıldı ${monthly.missed} / uyum %${monthly.compliance}`,
    '',
    'Günlük döküm',
    '────────────',
    dayBlocks,
    '',
    'Bu özet İlaç Takibi uygulamasından dışa aktarıldı.',
  ]
    .filter(line => line != null)
    .join('\n');
};

export const shareWeeklyAdherence = async (endDateKey = getTodayDateKey()) => {
  const text = await buildWeeklyAdherenceText(endDateKey);
  return shareReportFile(
    text,
    `ilac-takibi-uyum-${endDateKey}.txt`,
    'Haftalık uyum özeti',
  );
};

export const buildDiaryDoctorText = async () => {
  const profileId = await getActiveProfileId();
  const profiles = await getProfiles();
  const profileName =
    profiles.find(profile => profile.id === profileId)?.name || 'Ben';
  const entries = await getDiaryEntries();

  const lines = entries.length
    ? entries.map(entry => {
        const time = entry.createdAt
          ? formatStamp(new Date(entry.createdAt))
          : entry.date;
        const tags = (entry.tags || []).join(', ');
        const pill = entry.pillName ? `İlaç: ${entry.pillName}` : null;
        const tagLine = tags ? `Yan etkiler: ${tags}` : null;
        const note = entry.note ? `Not: ${entry.note}` : null;

        return [`• ${time}`, pill, tagLine, note].filter(Boolean).join('\n  ');
      })
    : ['Kayıt yok.'];

  return [
    'İlaç Takibi — doktor günlüğü',
    `Profil: ${profileName}`,
    `Oluşturulma: ${formatStamp()}`,
    `Kayıt sayısı: ${entries.length}`,
    '',
    'Notlar ve yan etkiler',
    '────────────────────',
    lines.join('\n\n'),
    '',
    'Bu rapor İlaç Takibi uygulamasından dışa aktarıldı.',
  ].join('\n');
};

export const shareDiaryDoctorReport = async () => {
  const text = await buildDiaryDoctorText();
  const stamp = getTodayDateKey();
  return shareReportFile(
    text,
    `ilac-takibi-doktor-gunlugu-${stamp}.txt`,
    'Doktor günlüğü',
  );
};
