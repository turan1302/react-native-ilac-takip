import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#0D9488',
  text: '#111827',
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default styles;
