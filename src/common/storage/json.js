export const parseJson = (value, fallback) => {
  if (value == null || value === '') {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('parseJson: unreadable value, leaving original data intact');
    return fallback;
  }
};

export const stringifyJson = value => JSON.stringify(value);
