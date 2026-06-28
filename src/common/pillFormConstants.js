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

export const FREQUENCIES = ['Her Gün', 'Haftalık', 'İhtiyaç Halinde'];

export const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0'),
);

export const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, '0'),
);

export const parseTime = value => {
  const [hour = '09', minute = '00'] = (value || '').split(':');
  return {
    hour: hour.padStart(2, '0'),
    minute: minute.padStart(2, '0'),
  };
};
