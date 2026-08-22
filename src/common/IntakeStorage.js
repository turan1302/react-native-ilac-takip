import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDoseKey } from './pillFormConstants';
import { getPillById, updatePill } from './PillStorage';
import { INTAKE_REPORTS_KEY } from './storage/keys';

export { INTAKE_REPORTS_KEY };

export const formatDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateKey = (date = new Date()) => formatDateKey(date);

export const getIntakeId = (pillId, date, time = '') =>
  `${pillId}_${date}_${time || 'asneeded'}`;

export const getIntakeReports = async () => {
  const data = await AsyncStorage.getItem(INTAKE_REPORTS_KEY);
  return data ? JSON.parse(data) : [];
};

const findReportIndex = (reports, pillId, date, time = '') => {
  const exactId = getIntakeId(pillId, date, time);
  const legacyId = `${pillId}_${date}`;

  return reports.findIndex(
    report => report.id === exactId || (!time && report.id === legacyId),
  );
};

export const getTakenDoseKeysForDate = async date => {
  const reports = await getIntakeReports();
  return new Set(
    reports
      .filter(report => report.date === date && report.status === 'taken')
      .map(report => getDoseKey(report.pillId, report.scheduledTime)),
  );
};

export const getTakenPillIdsForDate = async date => getTakenDoseKeysForDate(date);

export const getIntakeMapForDate = async date => {
  const reports = await getIntakeReports();
  const map = new Map();

  reports
    .filter(report => report.date === date)
    .forEach(report => {
      map.set(getDoseKey(report.pillId, report.scheduledTime), report);
      map.set(report.pillId, report);
    });

  return map;
};

const adjustStock = async (pill, delta) => {
  if (pill.stockQuantity == null) {
    return;
  }

  const latest = (await getPillById(pill.id)) || pill;
  const nextQuantity = Math.max(0, Number(latest.stockQuantity) + delta);
  await updatePill(pill.id, { stockQuantity: nextQuantity });
};

export const setPillIntakeStatus = async (
  pill,
  date,
  { status, time = pill.time || '', postponeUntil = null },
) => {
  const reports = await getIntakeReports();
  const logId = getIntakeId(pill.id, date, time);
  const index = findReportIndex(reports, pill.id, date, time);
  const previous = index >= 0 ? reports[index] : null;
  const wasTaken = previous?.status === 'taken';
  const willBeTaken = status === 'taken';

  const logEntry = {
    id: logId,
    pillId: pill.id,
    pillName: pill.name,
    dosage: pill.dosage || '',
    type: pill.type || '',
    scheduledTime: time,
    frequency: pill.frequency || '',
    date,
    status,
    taken: willBeTaken,
    takenAt: willBeTaken ? new Date().toISOString() : null,
    postponeUntil,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    reports[index] = logEntry;
  } else {
    reports.push(logEntry);
  }

  await AsyncStorage.setItem(INTAKE_REPORTS_KEY, JSON.stringify(reports));

  if (!wasTaken && willBeTaken) {
    await adjustStock(pill, -1);
  } else if (wasTaken && !willBeTaken) {
    await adjustStock(pill, 1);
  }

  return logEntry;
};

export const togglePillIntake = async (pill, date, taken, time) => {
  return setPillIntakeStatus(pill, date, {
    status: taken ? 'taken' : null,
    time: time ?? pill.time ?? '',
  });
};

export const removeIntakeReportsForPill = async pillId => {
  const reports = await getIntakeReports();
  const filtered = reports.filter(report => report.pillId !== pillId);
  await AsyncStorage.setItem(INTAKE_REPORTS_KEY, JSON.stringify(filtered));
};
