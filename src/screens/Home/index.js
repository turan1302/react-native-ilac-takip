import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPillsForProfile, isLowStock } from '../../common/PillStorage';
import {
  getTakenDoseKeysForDate,
  getTodayDateKey,
} from '../../common/IntakeStorage';
import { buildPillSections } from '../../common/pillHelpers';
import { useProfile } from '../../common/ProfileContext';
import useDoseActions from '../../hooks/useDoseActions';
import useRevealOnFocus from '../../hooks/useRevealOnFocus';
import AnimatedReveal from '../../components/shared/AnimatedReveal';
import AddPillFab from '../../components/Home/AddPillFab';
import EmptyState from '../../components/Home/EmptyState';
import Header from '../../components/Home/Header';
import PillSection from '../../components/Home/PillSection';
import SectionHeader from '../../components/Home/SectionHeader';
import TodaySummary from '../../components/Home/TodaySummary';
import LowStockCard from '../../components/Home/LowStockCard';
import styles, { COLORS } from './styles';

const Home = () => {
  const navigation = useNavigation();
  const today = getTodayDateKey();
  const { activeProfileId } = useProfile();
  const [sections, setSections] = useState([]);
  const [asNeededSection, setAsNeededSection] = useState(null);
  const [lowStockPills, setLowStockPills] = useState([]);

  const loadPills = useCallback(async () => {
    const pills = await getPillsForProfile(activeProfileId);
    const takenIds = await getTakenDoseKeysForDate(today);
    const { sections: pillSections, asNeededSection: asNeeded } = buildPillSections(
      pills,
      COLORS,
      takenIds,
      today,
    );

    setSections(pillSections);
    setAsNeededSection(asNeeded);
    setLowStockPills(pills.filter(isLowStock));
  }, [today, activeProfileId]);

  useFocusEffect(
    useCallback(() => {
      loadPills();
    }, [loadPills]),
  );

  const allItems = useMemo(() => {
    const scheduled = sections.flatMap(section => section.items);
    const asNeeded = asNeededSection?.items || [];
    return [...scheduled, ...asNeeded];
  }, [sections, asNeededSection]);

  const takenCount = allItems.filter(item => item.isTaken).length;
  const totalCount = allItems.length;
  const progressPercent =
    totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const { takeDose, skipDose, snoozeDose } = useDoseActions(today, loadPills);
  const revealKey = useRevealOnFocus();

  const handleAddPill = () => {
    navigation.navigate('AddPill');
  };

  const handleEditPill = item => {
    navigation.navigate('EditPill', { pillId: item.pill.id });
  };

  const handleSeeAll = () => {
    navigation.getParent()?.navigate('ProgramNavigator');
  };

  const hasPills = totalCount > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AnimatedReveal index={0} animationKey={revealKey} distance={12}>
          <Header />
        </AnimatedReveal>

        <AnimatedReveal index={1} animationKey={revealKey}>
          <TodaySummary
            progressPercent={progressPercent}
            takenCount={takenCount}
            totalCount={totalCount}
          />
        </AnimatedReveal>

        <AnimatedReveal index={2} animationKey={revealKey}>
          <LowStockCard pills={lowStockPills} />
        </AnimatedReveal>

        <AnimatedReveal index={3} animationKey={revealKey} distance={12}>
          <SectionHeader onSeeAll={handleSeeAll} />
        </AnimatedReveal>

        {!hasPills ? (
          <AnimatedReveal index={4} animationKey={revealKey}>
            <EmptyState />
          </AnimatedReveal>
        ) : (
          <>
            {sections.map((section, sectionIndex) => (
              <PillSection
                key={section.id}
                section={section}
                onTake={takeDose}
                onSkip={skipDose}
                onSnooze={snoozeDose}
                onPressEdit={handleEditPill}
                animationKey={revealKey}
                startIndex={4 + sectionIndex * 4}
              />
            ))}
            {asNeededSection && (
              <PillSection
                section={asNeededSection}
                onTake={takeDose}
                onSkip={skipDose}
                onSnooze={snoozeDose}
                onPressEdit={handleEditPill}
                animationKey={revealKey}
                startIndex={4 + sections.length * 4}
              />
            )}
          </>
        )}
      </ScrollView>

      <AddPillFab onPress={handleAddPill} />
    </SafeAreaView>
  );
};

export default Home;
