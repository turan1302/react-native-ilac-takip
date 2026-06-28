import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#F4F7FB',
  sectionMorning: '#F59E0B',
  sectionNoon: '#2563EB',
  sectionEvening: '#6366F1',
  sectionAsNeeded: '#8B5CF6',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
});

export default styles;
