import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  white: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  reminderIcon: '#0D9488',
  border: '#E5E7EB',
  reminderBg: '#EFF6FF',
  reminderIconBg: '#D1FAE5',
};

const styles = StyleSheet.create({
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.reminderBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  reminderIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.reminderIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderTextWrapper: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  reminderSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  switchTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  switchTrackOff: {
    backgroundColor: COLORS.border,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-end',
  },
  switchThumbOff: {
    alignSelf: 'flex-start',
  },
});

export default styles;
