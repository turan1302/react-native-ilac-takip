import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { THEME_MODE_KEY } from './storage/keys';

export { THEME_MODE_KEY };

export const THEME_MODES = [
  { value: 'system', label: 'Sistem' },
  { value: 'light', label: 'Açık' },
  { value: 'dark', label: 'Koyu' },
];

export const lightColors = {
  primary: '#2563EB',
  primarySoft: '#DBEAFE',
  background: '#F4F7FB',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  danger: '#DC2626',
  warning: '#B45309',
  success: '#059669',
  tabBar: '#FFFFFF',
  statusBar: 'dark-content',
  iconBg: '#DBEAFE',
  pendingBg: '#F0F9FF',
  pendingBorder: '#93C5FD',
  takenBadgeBg: '#D1FAE5',
  takenBadgeText: '#059669',
  skippedBadgeBg: '#FEE2E2',
  skippedBadgeText: '#DC2626',
  calendarActive: '#2563EB',
  calendarActiveText: '#FFFFFF',
  fab: '#2563EB',
};

export const darkColors = {
  primary: '#60A5FA',
  primarySoft: '#1E3A5F',
  background: '#0F172A',
  card: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  danger: '#F87171',
  warning: '#FBBF24',
  success: '#34D399',
  tabBar: '#1E293B',
  statusBar: 'light-content',
  iconBg: '#1E3A5F',
  pendingBg: '#172554',
  pendingBorder: '#3B82F6',
  takenBadgeBg: '#064E3B',
  takenBadgeText: '#34D399',
  skippedBadgeBg: '#7F1D1D',
  skippedBadgeText: '#FCA5A5',
  calendarActive: '#60A5FA',
  calendarActiveText: '#0F172A',
  fab: '#60A5FA',
};

export const getThemeMode = async () => {
  const value = await AsyncStorage.getItem(THEME_MODE_KEY);
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }
  return 'system';
};

export const setThemeMode = async mode => {
  const next = mode === 'light' || mode === 'dark' ? mode : 'system';
  await AsyncStorage.setItem(THEME_MODE_KEY, next);
  return next;
};

export const resolveIsDark = mode => {
  if (mode === 'dark') {
    return true;
  }
  if (mode === 'light') {
    return false;
  }
  return Appearance.getColorScheme() === 'dark';
};

export const getColorsForMode = mode =>
  resolveIsDark(mode) ? darkColors : lightColors;
