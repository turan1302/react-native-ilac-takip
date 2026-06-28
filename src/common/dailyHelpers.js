import { getIntakeMapForDate, getTodayDateKey } from './IntakeStorage';
import {
  buildPillSections,
  parseDateKeyParts,
  shiftDateKeyByDays,
} from './pillHelpers';

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

  const label = item.pill.notes?.trim() || item.dosage;
  return item.time ? `${label} • ${item.time}` : label;
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
  const intake = intakeMap.get(item.pill.id);

  if (intake?.taken) {
    return { status: 'taken', takenAt: intake.takenAt };
  }

  if (item.asNeeded) {
    if (dateKey < getTodayDateKey()) {
      return { status: 'skipped' };
    }

    return { status: 'pending' };
  }

  if (isPastScheduledTime(item.time, dateKey)) {
    return { status: 'skipped' };
  }

  return { status: 'pending' };
};

export const calculateWeeklyCompliance = async (pills, endDateKey, colors) => {
  let total = 0;
  let taken = 0;

  for (let offset = 6; offset >= 0; offset -= 1) {
    const dateKey = shiftDateKeyByDays(endDateKey, -offset);
    const intakeMap = await getIntakeMapForDate(dateKey);
    const takenIds = new Set(
      [...intakeMap.values()]
        .filter(report => report.taken)
        .map(report => report.pillId),
    );
    const { sections, asNeededSection } = buildPillSections(
      pills,
      colors,
      takenIds,
      dateKey,
    );
    const items = [
      ...sections.flatMap(section => section.items),
      ...(asNeededSection?.items || []),
    ];

    total += items.length;
    taken += items.filter(item => intakeMap.get(item.pill.id)?.taken).length;
  }

  return total > 0 ? Math.round((taken / total) * 100) : 0;
};

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
    item.pill?.type,
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
