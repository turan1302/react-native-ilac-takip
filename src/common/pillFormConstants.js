export const PILL_TYPES = [
  'Tablet',
  'Kapsül',
  'Şurup',
  'Enjeksiyon',
  'Aerosol',
  'Sprey',
  'Krem',
  'Gargara',
];

export const FREQUENCIES = [
  'Her Gün',
  'Haftalık',
  'Haftada 2 Gün',
  'Ayın Belirli Günleri',
  'Her 6 Saatte',
  'Her 8 Saatte',
  'Her 12 Saatte',
  'Belirli Tarih Aralığında',
  'İhtiyaç Halinde',
];

export const INTERVAL_HOURS = {
  'Her 6 Saatte': 6,
  'Her 8 Saatte': 8,
  'Her 12 Saatte': 12,
};

export const WEEKDAYS = [
  { value: 1, label: 'Pzt' },
  { value: 2, label: 'Sal' },
  { value: 3, label: 'Çar' },
  { value: 4, label: 'Per' },
  { value: 5, label: 'Cum' },
  { value: 6, label: 'Cmt' },
  { value: 0, label: 'Paz' },
];

export const MONTH_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);

export const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0'),
);

const MINUTE_STEP = 15;

export const MINUTES = Array.from({ length: 60 / MINUTE_STEP }, (_, index) =>
  String(index * MINUTE_STEP).padStart(2, '0'),
);

export const snapTimeParts = ({ hour, minute }) => {
  const minuteValue = Number(minute);

  if (Number.isNaN(minuteValue)) {
    return { hour, minute: '00' };
  }

  const snapped = Math.round(minuteValue / MINUTE_STEP) * MINUTE_STEP;

  if (snapped >= 60) {
    const nextHour = (Number(hour) + 1) % 24;
    return {
      hour: String(Number.isNaN(nextHour) ? 0 : nextHour).padStart(2, '0'),
      minute: '00',
    };
  }

  return {
    hour,
    minute: String(snapped).padStart(2, '0'),
  };
};

export const parseTime = value => {
  const [hour = '09', minute = '00'] = (value || '').split(':');
  return {
    hour: hour.padStart(2, '0'),
    minute: minute.padStart(2, '0'),
  };
};

export const isAsNeededFrequency = frequency =>
  (frequency || 'Her Gün') === 'İhtiyaç Halinde';

export const isIntervalFrequency = frequency =>
  Boolean(INTERVAL_HOURS[frequency]);

export const needsWeekdayPicker = frequency => frequency === 'Haftada 2 Gün';

export const needsMonthDayPicker = frequency =>
  frequency === 'Ayın Belirli Günleri';

export const needsDateRange = frequency =>
  frequency === 'Belirli Tarih Aralığında';

export const getIntervalTimes = (startTime = '09:00', intervalHours = 8) => {
  const { hour, minute } = parseTime(startTime);
  const times = [];
  const seen = new Set();
  let nextHour = Number(hour);

  for (let index = 0; index < 24 / intervalHours; index += 1) {
    const time = `${String(nextHour).padStart(2, '0')}:${minute}`;

    if (seen.has(time)) {
      break;
    }

    seen.add(time);
    times.push(time);
    nextHour = (nextHour + intervalHours) % 24;
  }

  return times;
};

export const getPillTimes = pill => {
  if (isAsNeededFrequency(pill.frequency)) {
    return [];
  }

  const intervalHours = INTERVAL_HOURS[pill.frequency];

  if (intervalHours) {
    return getIntervalTimes(pill.time || '08:00', intervalHours);
  }

  return pill.time?.includes(':') ? [pill.time] : [];
};

export const getDoseKey = (pillId, time = '') =>
  `${pillId}__${time || 'asneeded'}`;
