import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#0D9488',
  text: '#111827',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowActive: {
    backgroundColor: '#F0FDFA',
    marginHorizontal: -4,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    fontSize: 15,
    color: COLORS.text,
  },
  nameActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  presetChip: {
    backgroundColor: '#CCFBF1',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  presetText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});

export default styles;
