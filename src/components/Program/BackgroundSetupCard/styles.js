import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  text: '#111827',
  textSecondary: '#6B7280',
};

const styles = StyleSheet.create({
  backgroundSetupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  backgroundSetupTextWrap: {
    flex: 1,
  },
  backgroundSetupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  backgroundSetupSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
});

export default styles;
