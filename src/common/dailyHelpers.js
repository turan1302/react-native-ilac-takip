import { getIntakeMapForDate, getTodayDateKey } from './IntakeStorage';
import {
  buildPillSections,
  parseDateKeyParts,
  shiftDateKeyByDays,
} from './pillHelpers';
import { getMealRelationLabel } from './pillFormConstants';
import { getDoseDisplayTime } from './scheduleAdjustments';

export const MONTH_NAMES = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

export const SECTION_TIME_RANGES = {
  sabah: '08:00 - 10:00',
  ogle: '12:00 - 14:00',
  aksam: '19:00 - 21:00',
};

export const getMonthYearLabel = dateKey => {
  const { year, month } = parseDateKeyParts(dateKey);
  return `${MONTH_NAMES[month - 1]} ${year}`;
};

export const formatTakenAt = isoString => {
  if (!isoString) {
    return '';
  }

  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}'te onaylandı`;
};

export const getDetailText = item => {
  if (item.asNeeded) {
    return item.dosage;
  }

  const meal = getMealRelationLabel(item.pill?.mealRelation);
  const label = item.pill.notes?.trim() || item.dosage;
  const shownTime = getDoseDisplayTime(item);
  const parts = [label, shownTime, meal].filter(Boolean);
  return parts.join(' • ');
};

const isPastScheduledTime = (timeStr, dateKey) => {
  const today = getTodayDateKey();

  if (dateKey < today) {
    return true;
  }

  if (dateKey > today || !timeStr) {
    return false;
  }

  const [hour, minute] = timeStr.split(':').map(Number);
  const now = new Date();

  return (
    now.getHours() > hour ||
    (now.getHours() === hour && now.getMinutes() >= minute)
  );
};

export const getPillStatus = (item, dateKey, intakeMap) => {
  const intake =
    intakeMap.get(item.id) ||
    intakeMap.get(`${item.pill.id}__${item.time || 'asneeded'}`) ||
    intakeMap.get(item.pill.id);

  if (intake?.status === 'taken' || intake?.taken) {
    return { status: 'taken', takenAt: intake.takenAt };
  }

  if (intake?.status === 'skipped' || intake?.status === 'missed') {
    return { status: 'skipped' };
  }

  if (intake?.status === 'postponed') {
    return { status: 'postponed', postponeUntil: intake.postponeUntil };
  }

  if (item.asNeeded) {
    if (dateKey < getTodayDateKey()) {
      return { status: 'skipped' };
    }

    return { status: 'pending' };
  }

  if (isPastScheduledTime(getDoseDisplayTime(item), dateKey)) {
    return { status: 'skipped' };
  }

  return { status: 'pending' };
};

export const calculatePeriodStats = async (
  pills,
  endDateKey,
  colors,
  dayCount = 7,
  travelShifts = {},
) => {
  let total = 0;
  let taken = 0;
  let missed = 0;
  const today = getTodayDateKey();
  const days = [];

  for (let offset = dayCount - 1; offset >= 0; offset -= 1) {
    const dateKey = shiftDateKeyByDays(endDateKey, -offset);
    const intakeMap = await getIntakeMapForDate(dateKey);
    const takenIds = new Set(
      [...intakeMap.entries()]
        .filter(([, report]) => report.taken || report.status === 'taken')
        .map(([key]) => key),
    );
    const { sections, asNeededSection } = buildPillSections(
      pills,
      colors,
      takenIds,
      dateKey,
      travelShifts,
    );
    const items = [
      ...sections.flatMap(section => section.items),
      ...(asNeededSection?.items || []),
    ];

    let dayTotal = 0;
    let dayTaken = 0;
    let dayMissed = 0;

    items.forEach(item => {
      if (item.asNeeded) {
        if (item.isTaken) {
          total += 1;
          taken += 1;
          dayTotal += 1;
          dayTaken += 1;
        }
        return;
      }

      total += 1;
      dayTotal += 1;

      if (item.isTaken) {
        taken += 1;
        dayTaken += 1;
        return;
      }

      const isDue =
        dateKey < today ||
        (dateKey === today &&
          isPastScheduledTime(getDoseDisplayTime(item), dateKey));

      if (isDue) {
        missed += 1;
        dayMissed += 1;
      }
    });

    days.push({
      dateKey,
      total: dayTotal,
      taken: dayTaken,
      missed: dayMissed,
      compliance:
        dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : null,
    });
  }

  return {
    total,
    taken,
    missed,
    compliance: total > 0 ? Math.round((taken / total) * 100) : 0,
    days,
  };
};

export const calculateWeeklyStats = async (
  pills,
  endDateKey,
  colors,
  travelShifts = {},
) => calculatePeriodStats(pills, endDateKey, colors, 7, travelShifts);

export const calculateMonthlyStats = async (
  pills,
  endDateKey,
  colors,
  travelShifts = {},
) => calculatePeriodStats(pills, endDateKey, colors, 30, travelShifts);

const matchesSearchQuery = (item, query) => {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const fields = [
    item.name,
    item.dosage,
    item.time,
    item.pill?.notes,
    item.pill?.prospectus,
    item.pill?.type,
    getMealRelationLabel(item.pill?.mealRelation),
  ];

  return fields.some(field =>
    (field || '').toLowerCase().includes(normalized),
  );
};

export const filterSectionsByQuery = (sectionList, query) => {
  if (!query.trim()) {
    return sectionList;
  }

  return sectionList
    .map(section => ({
      ...section,
      items: section.items.filter(item => matchesSearchQuery(item, query)),
    }))
    .filter(section => section.items.length > 0);
};
