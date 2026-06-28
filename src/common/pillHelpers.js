const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MONTH_NAMES = [
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

const formatDateKey = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export { formatDateKey };

const parseDateKey = dateKey => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const TYPE_ICONS = {
  Tablet: 'pill',
  Kapsül: 'pill',
  Şurup: 'bottle-tonic-plus-outline',
  Enjeksiyon: 'needle',
  Aerosol: 'spray',
  Sprey: 'spray',
  Krem: 'lotion-outline',
  Gargara: 'cup-water',
};

const SECTION_CONFIG = [
  {
    id: 'sabah',
    title: 'SABAH',
    colorKey: 'sectionMorning',
    icon: 'sun',
  },
  {
    id: 'ogle',
    title: 'ÖĞLE',
    colorKey: 'sectionNoon',
    icon: 'sun',
  },
  {
    id: 'aksam',
    title: 'AKŞAM',
    colorKey: 'sectionEvening',
    icon: 'moon',
  },
];

export const getTypeIcon = type => TYPE_ICONS[type] || 'pill';

export const getTimeSection = time => {
  const hour = parseInt(time?.split(':')[0], 10) || 0;

  if (hour >= 5 && hour < 12) {
    return 'sabah';
  }

  if (hour >= 12 && hour < 18) {
    return 'ogle';
  }

  return 'aksam';
};

export const getWeekDaysForDate = (selectedDateKey = null) => {
  const today = new Date();
  const todayKey = formatDateKey(today);
  const selected = selectedDateKey ? parseDateKey(selectedDateKey) : today;
  const dayOfWeek = selected.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const start = new Date(selected);
  start.setDate(selected.getDate() + mondayOffset);

  const activeKey = selectedDateKey || todayKey;

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = formatDateKey(date);

    return {
      key: dateKey,
      day: DAY_NAMES[date.getDay()],
      date: date.getDate(),
      dateKey,
      active: dateKey === activeKey,
      isToday: dateKey === todayKey,
    };
  });
};

export const getWeekDays = (weekOffset = 0, selectedDateKey = null) => {
  const today = new Date();
  const reference = new Date(today);
  reference.setDate(today.getDate() + weekOffset * 7);
  return getWeekDaysForDate(
    selectedDateKey || formatDateKey(reference),
  );
};

export const shiftDateKeyByDays = (dateKey, days) => {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
};

export const formatDateLabel = dateKey => {
  const date = parseDateKey(dateKey);
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
};

export const parseDateKeyParts = dateKey => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return { year, month, day };
};

export const buildDateKey = ({ year, month, day }) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const safeDay = Math.min(day, daysInMonth);
  return `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
};

export const getDaysInMonth = (year, month) =>
  new Date(year, month, 0).getDate();

export const getYearOptions = (centerYear = new Date().getFullYear()) =>
  Array.from({ length: 5 }, (_, index) => centerYear - 2 + index);

export const getCurrentWeekDays = () => getWeekDaysForDate();

const getDaysBetween = (startDateKey, targetDateKey) => {
  const start = parseDateKey(startDateKey);
  const target = parseDateKey(targetDateKey);
  const startTime = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  ).getTime();
  const targetTime = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  ).getTime();

  return Math.round((targetTime - startTime) / (1000 * 60 * 60 * 24));
};

const getPillStartDateKey = pill => {
  if (pill.startDate) {
    return pill.startDate;
  }

  if (pill.createdAt) {
    return formatDateKey(new Date(pill.createdAt));
  }

  return formatDateKey(new Date());
};

export const shouldShowPillOnDate = (pill, selectedDateKey) => {
  const frequency = pill.frequency || 'Her Gün';

  if (frequency === 'İhtiyaç Halinde') {
    return true;
  }

  if (frequency === 'Haftalık') {
    const startDateKey = getPillStartDateKey(pill);
    const diffDays = getDaysBetween(startDateKey, selectedDateKey);
    return diffDays >= 0 && diffDays % 7 === 0;
  }

  return true;
};

const mapPillToItem = (pill, takenIds, asNeeded = false) => {
  const dosageText = [pill.dosage, pill.type].filter(Boolean).join(' • ');

  return {
    id: pill.id,
    name: pill.name,
    time: pill.time,
    dosage: dosageText || pill.type || '-',
    icon: getTypeIcon(pill.type),
    isTaken: takenIds.has(pill.id),
    asNeeded,
    pill,
  };
};

export const buildPillSections = (
  pills,
  colors,
  takenIds = new Set(),
  selectedDateKey = formatDateKey(new Date()),
) => {
  const grouped = {
    sabah: [],
    ogle: [],
    aksam: [],
  };

  const scheduledPills = pills.filter(
    pill => (pill.frequency || 'Her Gün') !== 'İhtiyaç Halinde',
  );
  const asNeededPills = pills.filter(
    pill => (pill.frequency || 'Her Gün') === 'İhtiyaç Halinde',
  );

  const visibleScheduled = scheduledPills
    .filter(pill => shouldShowPillOnDate(pill, selectedDateKey))
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  visibleScheduled.forEach(pill => {
    const sectionId = getTimeSection(pill.time);
    grouped[sectionId].push(mapPillToItem(pill, takenIds));
  });

  const sections = SECTION_CONFIG.map(section => ({
    ...section,
    color: colors[section.colorKey],
    items: grouped[section.id],
  })).filter(section => section.items.length > 0);

  const asNeededItems = asNeededPills
    .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    .map(pill => mapPillToItem(pill, takenIds, true));

  const asNeededSection =
    asNeededItems.length > 0
      ? {
          id: 'ihtiyac',
          title: 'İHTİYAÇ HALİNDE',
          color: colors.sectionAsNeeded,
          icon: 'activity',
          items: asNeededItems,
        }
      : null;

  return { sections, asNeededSection };
};
