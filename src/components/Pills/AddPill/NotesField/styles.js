import { StyleSheet } from 'react-native';

export const COLORS = {
  label: '#2563EB',
  white: '#FFFFFF',
  text: '#111827',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
};

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.label,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default styles;
