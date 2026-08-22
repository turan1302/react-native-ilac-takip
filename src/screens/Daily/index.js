import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPillsForProfile } from '../../common/PillStorage';
import {
  getIntakeMapForDate,
  getTakenDoseKeysForDate,
  getTodayDateKey,
} from '../../common/IntakeStorage';
import { useProfile } from '../../common/ProfileContext';
import useDoseActions from '../../hooks/useDoseActions';
import {
  buildDateKey,
  buildPillSections,
  getDaysInMonth,
  getWeekDaysForDate,
  getYearOptions,
  parseDateKeyParts,
} from '../../common/pillHelpers';
import {
  calculateWeeklyCompliance,
  filterSectionsByQuery,
} from '../../common/dailyHelpers';
import useDebounce from '../../hooks/useDebounce';
import useRevealOnFocus from '../../hooks/useRevealOnFocus';
import AnimatedReveal from '../../components/shared/AnimatedReveal';
import CalendarStrip from '../../components/Daily/CalendarStrip';
import DatePickerModal from '../../components/Daily/DatePickerModal';
import EmptyState from '../../components/Daily/EmptyState';
import Header from '../../components/Daily/Header';
import MotivationCard from '../../components/Daily/MotivationCard';
import PageIntro from '../../components/Daily/PageIntro';
import PillSection from '../../components/Daily/PillSection';
import SearchBar from '../../components/Daily/SearchBar';
import SearchEmptyState from '../../components/Daily/SearchEmptyState';
import StatsRow from '../../components/Daily/StatsRow';
import styles, { COLORS } from './styles';

const Daily = () => {
  const navigation = useNavigation();
  const { activeProfileId } = useProfile();
  const [weekDays, setWeekDays] = useState(getWeekDaysForDate(getTodayDateKey()));
  const [sections, setSections] = useState([]);
  const [asNeededSection, setAsNeededSection] = useState(null);
  const [intakeMap, setIntakeMap] = useState(new Map());
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());
  const [weeklyCompliance, setWeeklyCompliance] = useState(0);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [tempDay, setTempDay] = useState(1);
  const [tempMonth, setTempMonth] = useState(1);
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { debouncedValue: debouncedSearch, isDebouncing } = useDebounce(
    searchQuery,
    400,
  );

  const loadData = useCallback(async () => {
    const pills = await getPillsForProfile(activeProfileId);
    const map = await getIntakeMapForDate(selectedDate);
    const takenIds = await getTakenDoseKeysForDate(selectedDate);
    const { sections: pillSections, asNeededSection: asNeeded } = buildPillSections(
      pills,
      COLORS,
      takenIds,
      selectedDate,
    );
    const compliance = await calculateWeeklyCompliance(
      pills,
      selectedDate,
      COLORS,
    );

    setWeekDays(getWeekDaysForDate(selectedDate));
    setSections(pillSections);
    setAsNeededSection(asNeeded);
    setIntakeMap(map);
    setWeeklyCompliance(compliance);
  }, [selectedDate, activeProfileId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const allItems = useMemo(() => {
    const scheduled = sections.flatMap(section => section.items);
    const asNeeded = asNeededSection?.items || [];
    return [...scheduled, ...asNeeded];
  }, [sections, asNeededSection]);

  const { takeDose, skipDose, snoozeDose } = useDoseActions(
    selectedDate,
    loadData,
  );
  const revealKey = useRevealOnFocus();
  const listRevealKey = `${revealKey}-${selectedDate}-${debouncedSearch}`;

  const takenCount = allItems.filter(item => item.isTaken).length;
  const totalCount = allItems.length;
  const todayCompliance =
    totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const filteredSections = useMemo(
    () => filterSectionsByQuery(sections, debouncedSearch),
    [sections, debouncedSearch],
  );

  const filteredAsNeededSection = useMemo(() => {
    if (!asNeededSection) {
      return null;
    }

    const filtered = filterSectionsByQuery([asNeededSection], debouncedSearch);
    return filtered[0] || null;
  }, [asNeededSection, debouncedSearch]);

  const hasFilteredPills =
    filteredSections.length > 0 || filteredAsNeededSection?.items?.length > 0;

  const isSearchActive = debouncedSearch.trim().length > 0;
  const hasPills = totalCount > 0;

  const daysInMonth = getDaysInMonth(tempYear, tempMonth);
  const dayOptions = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const yearOptions = getYearOptions(tempYear);

  const handleToggleSearch = () => {
    if (searchVisible) {
      Keyboard.dismiss();
      setSearchQuery('');
    }

    setSearchVisible(prev => !prev);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleEditPill = item => {
    navigation.navigate('EditPill', { pillId: item.pill.id });
  };

  const openDateModal = () => {
    const { year, month, day } = parseDateKeyParts(selectedDate);
    setTempYear(year);
    setTempMonth(month);
    setTempDay(day);
    setDateModalVisible(true);
  };

  const confirmDate = () => {
    setSelectedDate(
      buildDateKey({ year: tempYear, month: tempMonth, day: tempDay }),
    );
    setDateModalVisible(false);
  };

  const goToToday = () => {
    setSelectedDate(getTodayDateKey());
    setDateModalVisible(false);
  };

  const handleSelectDay = dateKey => {
    setSelectedDate(dateKey);
  };

  const handleScrollBeginDrag = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={handleScrollBeginDrag}
          automaticallyAdjustKeyboardInsets={false}
        >
          <AnimatedReveal index={0} animationKey={revealKey} distance={12}>
            <Header
              searchVisible={searchVisible}
              onToggleSearch={handleToggleSearch}
            />
          </AnimatedReveal>

          {searchVisible && (
            <AnimatedReveal index={1} animationKey={`${revealKey}-search`}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                isDebouncing={isDebouncing}
                onClear={handleClearSearch}
              />
            </AnimatedReveal>
          )}

          <AnimatedReveal index={2} animationKey={revealKey}>
            <PageIntro />
          </AnimatedReveal>

          <AnimatedReveal index={3} animationKey={revealKey}>
            <StatsRow
              todayCompliance={todayCompliance}
              takenCount={takenCount}
            />
          </AnimatedReveal>

          <AnimatedReveal index={4} animationKey={revealKey}>
            <CalendarStrip
              selectedDate={selectedDate}
              weekDays={weekDays}
              onSelectDay={handleSelectDay}
              onOpenCalendar={openDateModal}
            />
          </AnimatedReveal>

          {!hasPills ? (
            <AnimatedReveal index={5} animationKey={listRevealKey}>
              <EmptyState />
            </AnimatedReveal>
          ) : isSearchActive && !hasFilteredPills ? (
            <AnimatedReveal index={5} animationKey={listRevealKey}>
              <SearchEmptyState query={debouncedSearch} />
            </AnimatedReveal>
          ) : (
            <>
              {filteredSections.map((section, sectionIndex) => (
                <PillSection
                  key={section.id}
                  section={section}
                  selectedDate={selectedDate}
                  intakeMap={intakeMap}
                  onTake={takeDose}
                  onSkip={skipDose}
                  onSnooze={snoozeDose}
                  onPressEdit={handleEditPill}
                  animationKey={listRevealKey}
                  startIndex={5 + sectionIndex * 4}
                />
              ))}
              {filteredAsNeededSection && (
                <PillSection
                  section={filteredAsNeededSection}
                  selectedDate={selectedDate}
                  intakeMap={intakeMap}
                  onTake={takeDose}
                  onSkip={skipDose}
                  onSnooze={snoozeDose}
                  onPressEdit={handleEditPill}
                  animationKey={listRevealKey}
                  startIndex={5 + filteredSections.length * 4}
                />
              )}
            </>
          )}

          <AnimatedReveal index={6} animationKey={revealKey}>
            <MotivationCard weeklyCompliance={weeklyCompliance} />
          </AnimatedReveal>
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePickerModal
        visible={dateModalVisible}
        dayOptions={dayOptions}
        yearOptions={yearOptions}
        tempDay={tempDay}
        tempMonth={tempMonth}
        tempYear={tempYear}
        onClose={() => setDateModalVisible(false)}
        onSelectDay={setTempDay}
        onSelectMonth={setTempMonth}
        onSelectYear={setTempYear}
        onGoToToday={goToToday}
        onConfirm={confirmDate}
      />
    </SafeAreaView>
  );
};

export default Daily;
