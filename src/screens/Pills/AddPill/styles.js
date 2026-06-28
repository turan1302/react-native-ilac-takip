import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#F8FAFC',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
});

export default styles;
