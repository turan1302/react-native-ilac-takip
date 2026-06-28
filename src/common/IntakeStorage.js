import AsyncStorage from '@react-native-async-storage/async-storage';

export const INTAKE_REPORTS_KEY = 'pill_intake_reports';

export const formatDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateKey = (date = new Date()) => formatDateKey(date);

export const getIntakeReports = async () => {
  const data = await AsyncStorage.getItem(INTAKE_REPORTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getTakenPillIdsForDate = async date => {
  const reports = await getIntakeReports();
  return new Set(
    reports.filter(report => report.date === date && report.taken).map(
      report => report.pillId,
    ),
  );
};

export const getIntakeMapForDate = async date => {
  const reports = await getIntakeReports();
  const map = new Map();

  reports
    .filter(report => report.date === date)
    .forEach(report => {
      map.set(report.pillId, report);
    });

  return map;
};

export const togglePillIntake = async (pill, date, taken) => {
  const reports = await getIntakeReports();
  const logId = `${pill.id}_${date}`;
  const index = reports.findIndex(report => report.id === logId);

  const logEntry = {
    id: logId,
    pillId: pill.id,
    pillName: pill.name,
    dosage: pill.dosage || '',
    type: pill.type || '',
    scheduledTime: pill.time,
    frequency: pill.frequency || '',
    date,
    taken,
    takenAt: taken ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    reports[index] = logEntry;
  } else {
    reports.push(logEntry);
  }

  await AsyncStorage.setItem(INTAKE_REPORTS_KEY, JSON.stringify(reports));
  return logEntry;
};

export const removeIntakeReportsForPill = async pillId => {
  const reports = await getIntakeReports();
  const filtered = reports.filter(report => report.pillId !== pillId);
  await AsyncStorage.setItem(INTAKE_REPORTS_KEY, JSON.stringify(filtered));
};
