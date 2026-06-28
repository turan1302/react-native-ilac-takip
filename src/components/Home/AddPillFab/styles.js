import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  white: '#FFFFFF',
  fab: '#1D4ED8',
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.fab,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default styles;
