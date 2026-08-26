import { Linking } from 'react-native';
import { getPillById } from './PillStorage';
import { getTodayDateKey, setPillIntakeStatus } from './IntakeStorage';

const parseQuery = url => {
  const query = String(url || '').split('?')[1] || '';

  return query.split('&').reduce((params, part) => {
    if (!part) {
      return params;
    }

    const [rawKey, rawValue = ''] = part.split('=');
    params[decodeURIComponent(rawKey)] = decodeURIComponent(
      rawValue.replace(/\+/g, ' '),
    );
    return params;
  }, {});
};

export const parseTakeItemsFromUrl = url => {
  if (!url || !String(url).startsWith('ilactakip://')) {
    return [];
  }

  const path = String(url).replace('ilactakip://', '');

  if (!path.startsWith('take')) {
    return [];
  }

  const params = parseQuery(url);

  if (params.items) {
    try {
      const parsed = JSON.parse(params.items);
      return Array.isArray(parsed)
        ? parsed.filter(item => item?.pillId)
        : [];
    } catch (error) {
      console.warn('parseTakeItemsFromUrl items:', error);
    }
  }

  if (params.pillId) {
    return [{ pillId: params.pillId, time: params.time || '' }];
  }

  return [];
};

export const markDosesTaken = async items => {
  const today = getTodayDateKey();
  const takenPills = [];

  for (const item of items || []) {
    const pill = item.pill || (await getPillById(item.pillId));

    if (!pill) {
      continue;
    }

    await setPillIntakeStatus(pill, today, {
      status: 'taken',
      time: item.time || '',
    });
    takenPills.push(pill);
  }

  return takenPills;
};

export const handleDoseDeepLink = async url => markDosesTaken(parseTakeItemsFromUrl(url));

export const subscribeDoseDeepLinks = onHandled => {
  const subscription = Linking.addEventListener('url', event => {
    handleDoseDeepLink(event?.url).then(takenPills => {
      if (takenPills.length) {
        onHandled?.(takenPills);
      }
    });
  });

  Linking.getInitialURL().then(url => {
    handleDoseDeepLink(url).then(takenPills => {
      if (takenPills.length) {
        onHandled?.(takenPills);
      }
    });
  });

  return () => subscription.remove();
};
