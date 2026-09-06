import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { THEME_MODES } from '../../../common/ThemeStorage';
import { useTheme } from '../../../common/ThemeContext';
import styles from '../QuietHoursSection/styles';

const ThemeSection = () => {
  const { mode, setMode, colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconWrapper, { backgroundColor: colors.primarySoft }]}>
          <Feather name="moon" size={18} color={colors.primary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: colors.text }]}>Görünüm</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Gece dozunda koyu tema gözü yorarmaz
          </Text>
        </View>
      </View>
      <View style={styles.timeRow}>
        {THEME_MODES.map(item => {
          const active = mode === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.timeButton,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              onPress={() => setMode(item.value)}
            >
              <Text style={[styles.timeCaption, { color: colors.textSecondary }]}>
                Tema
              </Text>
              <Text style={[styles.timeValue, { color: colors.text }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ThemeSection;
