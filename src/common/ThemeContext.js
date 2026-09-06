import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance } from 'react-native';
import {
  getColorsForMode,
  getThemeMode,
  resolveIsDark,
  setThemeMode as persistThemeMode,
} from './ThemeStorage';

const ThemeContext = createContext({
  mode: 'system',
  isDark: false,
  colors: getColorsForMode('system'),
  setMode: async () => {},
});

export const ThemeProvider = ({ children }) => {
  const [mode, setModeState] = useState('system');
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    getThemeMode().then(setModeState);
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  const setMode = useCallback(async next => {
    const saved = await persistThemeMode(next);
    setModeState(saved);
  }, []);

  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemScheme === 'dark';
    }
    return resolveIsDark(mode);
  }, [mode, systemScheme]);

  const colors = useMemo(() => getColorsForMode(mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode), [mode, systemScheme]);

  const value = useMemo(
    () => ({ mode, isDark, colors, setMode }),
    [mode, isDark, colors, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
