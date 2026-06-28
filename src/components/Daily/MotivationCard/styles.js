import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  text: '#111827',
  textSecondary: '#6B7280',
  motivationBg: '#EFF6FF',
  motivationIconBg: '#FFFFFF',
  statCardBorder: '#DBEAFE',
};

const styles = StyleSheet.create({
  motivationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.motivationBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.statCardBorder,
    padding: 16,
    marginTop: 8,
    gap: 14,
    alignItems: 'flex-start',
  },
  motivationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.motivationIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.statCardBorder,
  },
  motivationContent: {
    flex: 1,
  },
  motivationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  motivationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
});

export default styles;
