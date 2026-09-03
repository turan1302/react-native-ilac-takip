import { DEFAULT_PROFILE_ID } from './ProfileStorage';

const pad = value => String(value).padStart(2, '0');

export const applyOffsetToTime = (time, offsetMinutes) => {
  if (!offsetMinutes) {
    return time || '';
  }

  const [hour, minute] = (time || '09:00').split(':').map(Number);
  const date = new Date(2000, 0, 1, hour || 0, minute || 0, 0, 0);
  date.setMinutes(date.getMinutes() + offsetMinutes);

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const getShiftOffsetMinutes = (shift, dateKey) => {
  if (!shift?.dateKey || !shift.offsetHours || shift.dateKey !== dateKey) {
    return 0;
  }

  return Number(shift.offsetHours) * 60;
};

export const getPillShiftOffsetMinutes = (
  pill,
  dateKey,
  shiftsByProfile = {},
) => {
  const shift = shiftsByProfile[pill?.profileId || DEFAULT_PROFILE_ID];
  return getShiftOffsetMinutes(shift, dateKey);
};

export const getDoseDisplayTime = item =>
  item?.displayTime || item?.time || '';

export const isPillPausedOnDate = (pill, dateKey) => {
  if (!pill?.pauseUntil || !dateKey) {
    return false;
  }

  const start = pill.pauseStart || pill.pauseUntil;
  return dateKey >= start && dateKey <= pill.pauseUntil;
};

export const MISSED_ADVICE_OPTIONS = [
  { value: 'take_now', label: 'Şimdi al' },
  { value: 'wait_next', label: 'Bir sonrakini bekle' },
  { value: 'ask_doctor', label: 'Doktora sor' },
];

const MISSED_ADVICE_TEXT = {
  take_now: 'Kaçırdıysan şimdi al.',
  wait_next: 'Kaçırdıysan bir sonrakini bekle, çift doz alma.',
  ask_doctor: 'Kaçırdıysan doktora sor.',
};

export const getMissedAdviceText = pill => {
  const custom = String(pill?.missedAdviceNote || '').trim();
  if (custom) {
    return custom;
  }

  return MISSED_ADVICE_TEXT[pill?.missedAdvice] || '';
};
