import { addPill, getPills } from './PillStorage';
import { setPillIntakeStatus, getTodayDateKey } from './IntakeStorage';
import { addDiaryEntry } from './DiaryStorage';
import { addMeasurement } from './MeasurementStorage';
import { addProfile, DEFAULT_PROFILE_ID, getProfiles } from './ProfileStorage';
import { shiftDateKeyByDays } from './pillHelpers';
import { rescheduleAllReminders } from './NotificationService';

export const seedDemoData = async ({ force = false } = {}) => {
  const today = getTodayDateKey();
  const profiles = await getProfiles();

  if (!profiles.some(profile => profile.id === 'mom')) {
    await addProfile({ id: 'mom', name: 'Annem', icon: 'account-heart' });
  }

  const existing = await getPills();
  if (!force && existing.length >= 3) {
    return { seeded: false, reason: 'already_has_pills' };
  }

  const mine = await addPill({
    name: 'Aspirin',
    dosage: '100 mg',
    type: 'Tablet',
    frequency: 'Her Gün',
    time: '09:00',
    mealRelation: 'after',
    notes: 'Kahvaltıdan sonra',
    missedAdvice: 'take_now',
    missedAdviceNote: 'Kaçırdıysan şimdi al, çift alma',
    stockQuantity: 28,
    stockThreshold: 5,
    profileId: DEFAULT_PROFILE_ID,
    startDate: today,
  });

  const evening = await addPill({
    name: 'Metformin',
    dosage: '500 mg',
    type: 'Tablet',
    frequency: 'Her Gün',
    time: '20:00',
    mealRelation: 'after',
    missedAdvice: 'wait_next',
    stockQuantity: 40,
    profileId: DEFAULT_PROFILE_ID,
    startDate: today,
  });

  await addPill({
    name: 'Tansiyon',
    dosage: '5 mg',
    type: 'Tablet',
    frequency: 'Her Gün',
    time: '08:00',
    mealRelation: 'empty',
    missedAdvice: 'ask_doctor',
    stockQuantity: 15,
    profileId: 'mom',
    startDate: today,
  });

  await addPill({
    name: 'D Vitamini',
    dosage: '1000 IU',
    type: 'Kapsül',
    frequency: 'Her Gün',
    time: '10:00',
    profileId: 'mom',
    startDate: today,
  });

  await setPillIntakeStatus(mine, today, { status: 'taken', time: '09:00' });
  await setPillIntakeStatus(evening, shiftDateKeyByDays(today, -1), {
    status: 'taken',
    time: '20:00',
  });

  await addMeasurement({
    type: 'bp',
    value: '128/82',
    pillId: mine.id,
    pillName: mine.name,
    profileId: DEFAULT_PROFILE_ID,
    note: 'İlaç sonrası',
  });

  await addMeasurement({
    type: 'sugar',
    value: '118',
    pillId: evening.id,
    pillName: evening.name,
    profileId: DEFAULT_PROFILE_ID,
  });

  await addMeasurement({
    type: 'weight',
    value: '74.2',
    profileId: DEFAULT_PROFILE_ID,
  });

  await addDiaryEntry({
    pillId: mine.id,
    pillName: mine.name,
    note: 'Hafif mide rahatsızlığı oldu, geçti.',
    tags: ['Mide'],
  });

  await rescheduleAllReminders();

  return { seeded: true };
};
