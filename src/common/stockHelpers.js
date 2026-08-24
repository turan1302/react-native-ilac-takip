import { getPillTimes, isAsNeededFrequency } from './pillFormConstants';

export const getDosesPerDay = pill => {
  if (isAsNeededFrequency(pill.frequency)) {
    return 1;
  }

  return Math.max(getPillTimes(pill).length, 1);
};

export const getDaysUntilStockRunsOut = pill => {
  if (pill?.stockQuantity == null || pill.stockQuantity === '') {
    return null;
  }

  const quantity = Number(pill.stockQuantity);

  if (!Number.isFinite(quantity)) {
    return null;
  }

  return Math.floor(quantity / getDosesPerDay(pill));
};

export const getStockEtaLabel = pill => {
  const days = getDaysUntilStockRunsOut(pill);

  if (days == null) {
    return '';
  }

  if (days <= 0) {
    return 'Stok bitti, yenileyin';
  }

  if (days === 1) {
    return `≈ 1 gün sonra biter (${pill.stockQuantity})`;
  }

  return `≈ ${days} gün sonra biter (${pill.stockQuantity})`;
};
