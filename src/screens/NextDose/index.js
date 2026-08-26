import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import * as NavigationService from '../../common/NavigationService';
import { getTodayNudgeSnapshot } from '../../common/nextDoseHelpers';
import { markDosesTaken } from '../../common/DoseLinking';
import { notifyLowStockIfNeeded, rescheduleAllReminders } from '../../common/NotificationService';
import styles, { COLORS } from './styles';

const NextDose = () => {
  const [snapshot, setSnapshot] = useState(null);
  const [taking, setTaking] = useState(false);

  const goHome = useCallback(() => {
    NavigationService.reset();
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const next = await getTodayNudgeSnapshot();
      if (!cancelled) {
        setSnapshot(next);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTake = async () => {
    if (!snapshot?.items?.length || taking) {
      return;
    }

    setTaking(true);
    const takenPills = await markDosesTaken(snapshot.items);
    await Promise.all(takenPills.map(pill => notifyLowStockIfNeeded(pill)));
    await rescheduleAllReminders();
    goHome();
  };

  if (!snapshot) {
    return <SafeAreaView style={styles.container} />;
  }

  const canTake = snapshot.items.length > 0;
  const overdue = snapshot.kind === 'overdue';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.content}>
        <View style={styles.badge}>
          <Feather name={overdue ? 'bell' : 'clock'} size={18} color={COLORS.primary} />
          <Text style={styles.badgeText}>{snapshot.kicker}</Text>
        </View>

        <Text style={styles.headline}>{snapshot.headline}</Text>
        <Text style={styles.subtitle}>{snapshot.subtitle}</Text>

        {canTake ? (
          <TouchableOpacity
            style={styles.takeButton}
            onPress={handleTake}
            activeOpacity={0.85}
            disabled={taking}
          >
            <Text style={styles.takeButtonText}>
              {taking ? 'Kaydediliyor…' : 'Aldım'}
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.skipButton} onPress={goHome} activeOpacity={0.8}>
          <Text style={styles.skipButtonText}>Ana sayfa</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NextDose;
