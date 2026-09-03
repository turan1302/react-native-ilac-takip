import { getPills } from './PillStorage';
import {
  getIntakeMapForDate,
  getTakenDoseKeysForDate,
  getTodayDateKey,
} from './IntakeStorage';
import { buildPillSections } from './pillHelpers';
import { getDaysUntilStockRunsOut } from './stockHelpers';
import { getAllTravelShifts } from './TravelShiftStorage';
import { getDoseDisplayTime } from './scheduleAdjustments';

export const NEXT_DOSE_SECTION_COLORS = {
  sectionMorning: '#F59E0B',
  sectionNoon: '#2563EB',
  sectionEvening: '#6366F1',
  sectionAsNeeded: '#8B5CF6',
};

export const REFILL_DAYS_BEFORE = 3;

const parseTimeToMinutes = time => {
  const [hour, minute] = (time || '00:00').split(':').map(Number);
  return (Number(hour) || 0) * 60 + (Number(minute) || 0);
};

export const joinNames = names => {
  const clean = (names || []).filter(Boolean);

  if (clean.length === 0) {
    return '';
  }

  if (clean.length === 1) {
    return clean[0];
  }

  if (clean.length === 2) {
    return `${clean[0]} ve ${clean[1]}`;
  }

  return `${clean.slice(0, -1).join(', ')} ve ${clean[clean.length - 1]}`;
};

export const getScheduledDoseItems = (sections = []) =>
  sections.flatMap(section => section.items || []).filter(item => !item.asNeeded);

const isPendingItem = (item, intakeMap) => {
  if (item.isTaken) {
    return false;
  }

  const report = intakeMap?.get(item.id);
  return report?.status !== 'skipped' && report?.status !== 'missed';
};

const groupByTime = items => {
  if (!items.length) {
    return [];
  }

  const firstTime = getDoseDisplayTime(items[0]);
  return items.filter(item => getDoseDisplayTime(item) === firstTime);
};

export const getNudgeState = (items = [], now = new Date(), intakeMap = null) => {
  const pending = items
    .filter(item => isPendingItem(item, intakeMap))
    .sort(
      (left, right) =>
        parseTimeToMinutes(getDoseDisplayTime(left)) -
        parseTimeToMinutes(getDoseDisplayTime(right)),
    );

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const overdue = pending.filter(
    item => parseTimeToMinutes(getDoseDisplayTime(item)) <= nowMinutes,
  );
  const upcoming = pending.filter(
    item => parseTimeToMinutes(getDoseDisplayTime(item)) > nowMinutes,
  );

  if (overdue.length) {
    const group = groupByTime(overdue);
    const names = joinNames(group.map(item => item.name));

    return {
      kind: 'overdue',
      kicker: 'Hadi, ilacını al',
      headline:
        group.length === 1 ? `Hadi, ${group[0].name} al` : 'Hadi, ilaçlarını al',
      subtitle: `${names} • ${getDoseDisplayTime(group[0])}`,
      time: getDoseDisplayTime(group[0]) || '',
      items: group,
    };
  }

  if (upcoming.length) {
    const group = groupByTime(upcoming);
    const names = joinNames(group.map(item => item.name));

    return {
      kind: 'upcoming',
      kicker: 'Sıradaki doz',
      headline:
        group.length === 1
          ? `Sıradaki: ${group[0].name}`
          : `Sıradaki: ${group.length} ilaç`,
      subtitle: `${names} • ${getDoseDisplayTime(group[0])}`,
      time: getDoseDisplayTime(group[0]) || '',
      items: group,
    };
  }

  if (items.length) {
    return {
      kind: 'done',
      kicker: 'Bugün',
      headline: 'Bugünkü ilaçlar tamam',
      subtitle: 'Sıradaki doz yok',
      time: '',
      items: [],
    };
  }

  return {
    kind: 'empty',
    kicker: 'İlaç Takibi',
    headline: 'Sıradaki ilaç yok',
    subtitle: 'Ana ekrandan ilaç ekleyin',
    time: '',
    items: [],
  };
};

export const getTodayNudgeSnapshot = async (now = new Date()) => {
  const today = getTodayDateKey(now);
  const [pills, takenIds, intakeMap, travelShifts] = await Promise.all([
    getPills(),
    getTakenDoseKeysForDate(today),
    getIntakeMapForDate(today),
    getAllTravelShifts(),
  ]);
  const { sections } = buildPillSections(
    pills,
    NEXT_DOSE_SECTION_COLORS,
    takenIds,
    today,
    travelShifts,
  );
  const items = getScheduledDoseItems(sections);

  return getNudgeState(items, now, intakeMap);
};

export const getRefillPills = (pills = []) =>
  pills.filter(pill => {
    const days = getDaysUntilStockRunsOut(pill);
    return days != null && days <= REFILL_DAYS_BEFORE;
  });

export const buildWidgetPayload = snapshot => {
  const first = snapshot.items?.[0];

  return {
    kind: snapshot.kind,
    kicker: snapshot.kicker,
    title: snapshot.headline,
    subtitle: snapshot.subtitle,
    time: snapshot.time || '',
    pillId: first?.pill?.id ? String(first.pill.id) : '',
    itemsJson: JSON.stringify(
      (snapshot.items || []).map(item => ({
        pillId: String(item.pill?.id || ''),
        time: item.time || '',
      })),
    ),
  };
};
