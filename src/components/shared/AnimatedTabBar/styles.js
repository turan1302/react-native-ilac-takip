import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#FFFFFF',
  border: '#E5E7EB',
  indicator: '#BBF7D0',
};

const styles = StyleSheet.create({
  bar: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'visible',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  track: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
    marginTop: 6,
  },
  indicator: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 0,
    borderRadius: 20,
    backgroundColor: COLORS.indicator,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});

export default styles;
