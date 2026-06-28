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
import { getPills } from '../../common/PillStorage';
import {
  getIntakeMapForDate,
  getTodayDateKey,
  togglePillIntake,
} from '../../common/IntakeStorage';
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
    const pills = await getPills();
    const map = await getIntakeMapForDate(selectedDate);
    const takenIds = new Set(
      [...map.values()]
        .filter(report => report.taken)
        .map(report => report.pillId),
    );
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
  }, [selectedDate]);

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

  const takenCount = allItems.filter(
    item => intakeMap.get(item.pill.id)?.taken,
  ).length;
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

  const handleTake = async item => {
    await togglePillIntake(item.pill, selectedDate, true);
    await loadData();
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={handleScrollBeginDrag}
          automaticallyAdjustKeyboardInsets
        >
          <Header
            searchVisible={searchVisible}
            onToggleSearch={handleToggleSearch}
          />

          {searchVisible && (
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              isDebouncing={isDebouncing}
              onClear={handleClearSearch}
            />
          )}

          <PageIntro />

          <StatsRow
            todayCompliance={todayCompliance}
            takenCount={takenCount}
          />

          <CalendarStrip
            selectedDate={selectedDate}
            weekDays={weekDays}
            onSelectDay={handleSelectDay}
            onOpenCalendar={openDateModal}
          />

          {!hasPills ? (
            <EmptyState />
          ) : isSearchActive && !hasFilteredPills ? (
            <SearchEmptyState query={debouncedSearch} />
          ) : (
            <>
              {filteredSections.map(section => (
                <PillSection
                  key={section.id}
                  section={section}
                  selectedDate={selectedDate}
                  intakeMap={intakeMap}
                  onTake={handleTake}
                  onPressEdit={handleEditPill}
                />
              ))}
              {filteredAsNeededSection && (
                <PillSection
                  section={filteredAsNeededSection}
                  selectedDate={selectedDate}
                  intakeMap={intakeMap}
                  onTake={handleTake}
                  onPressEdit={handleEditPill}
                />
              )}
            </>
          )}

          <MotivationCard weeklyCompliance={weeklyCompliance} />
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
