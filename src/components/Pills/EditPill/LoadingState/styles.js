import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#F8FAFC',
  primary: '#2563EB',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
