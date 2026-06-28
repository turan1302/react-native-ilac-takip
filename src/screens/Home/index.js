import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPills } from '../../common/PillStorage';
import {
  getTakenPillIdsForDate,
  getTodayDateKey,
  togglePillIntake,
} from '../../common/IntakeStorage';
import { buildPillSections } from '../../common/pillHelpers';
import AddPillFab from '../../components/Home/AddPillFab';
import EmptyState from '../../components/Home/EmptyState';
import Header from '../../components/Home/Header';
import PillSection from '../../components/Home/PillSection';
import SectionHeader from '../../components/Home/SectionHeader';
import TodaySummary from '../../components/Home/TodaySummary';
import styles, { COLORS } from './styles';

const Home = () => {
  const navigation = useNavigation();
  const today = getTodayDateKey();
  const [sections, setSections] = useState([]);
  const [asNeededSection, setAsNeededSection] = useState(null);

  const loadPills = useCallback(async () => {
    const pills = await getPills();
    const takenIds = await getTakenPillIdsForDate(today);
    const { sections: pillSections, asNeededSection: asNeeded } = buildPillSections(
      pills,
      COLORS,
      takenIds,
      today,
    );

    setSections(pillSections);
    setAsNeededSection(asNeeded);
  }, [today]);

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

  const handleToggleTaken = async item => {
    await togglePillIntake(item.pill, today, !item.isTaken);
    await loadPills();
  };

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
        <Header />

        <TodaySummary
          progressPercent={progressPercent}
          takenCount={takenCount}
          totalCount={totalCount}
        />

        <SectionHeader onSeeAll={handleSeeAll} />

        {!hasPills ? (
          <EmptyState />
        ) : (
          <>
            {sections.map(section => (
              <PillSection
                key={section.id}
                section={section}
                onToggleTaken={handleToggleTaken}
                onPressEdit={handleEditPill}
              />
            ))}
            {asNeededSection && (
              <PillSection
                section={asNeededSection}
                onToggleTaken={handleToggleTaken}
                onPressEdit={handleEditPill}
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
