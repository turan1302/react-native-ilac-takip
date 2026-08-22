import { getPillsForProfile } from './PillStorage';
import { getActiveProfileId } from './ProfileStorage';
import { getTakenPillIdsForDate, getTodayDateKey } from './IntakeStorage';
import { getDismissedPillIdsForDate } from './InAppNotificationStorage';
import { buildPillSections } from './pillHelpers';

const COLORS = {
  sectionMorning: '#F59E0B',
  sectionNoon: '#2563EB',
  sectionEvening: '#6366F1',
  sectionAsNeeded: '#8B5CF6',
};

export const isPastScheduledTime = (timeStr, dateKey) => {
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

export const getMissedNotifications = async (
  dateKey = getTodayDateKey(),
) => {
  const profileId = await getActiveProfileId();
  const pills = await getPillsForProfile(profileId);
  const takenIds = await getTakenPillIdsForDate(dateKey);
  const dismissedIds = await getDismissedPillIdsForDate(dateKey);

  const { sections, asNeededSection } = buildPillSections(
    pills,
    COLORS,
    takenIds,
    dateKey,
  );

  const items = [
    ...sections.flatMap(section => section.items),
    ...(asNeededSection?.items || []),
  ];

  return items
    .filter(item => !item.isTaken && !item.asNeeded)
    .filter(item => isPastScheduledTime(item.time, dateKey))
    .map(item => ({
      id: `${item.pill.id}_${dateKey}`,
      pillId: item.pill.id,
      pill: item.pill,
      name: item.name,
      time: item.time,
      dosage: item.dosage,
      icon: item.icon,
      date: dateKey,
      dismissed: dismissedIds.has(item.pill.id),
    }))
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
};

export const getNotificationBadgeCount = async (
  dateKey = getTodayDateKey(),
) => {
  const missed = await getMissedNotifications(dateKey);
  return missed.length;
};
