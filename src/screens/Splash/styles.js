import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#24C0B8',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
});

export default styles;
