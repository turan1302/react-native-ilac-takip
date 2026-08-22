import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StatusBar, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPillsForProfile } from '../../common/PillStorage';
import {
  getTakenDoseKeysForDate,
  getTodayDateKey,
} from '../../common/IntakeStorage';
import { useProfile } from '../../common/ProfileContext';
import useDoseActions from '../../hooks/useDoseActions';
import {
  getRemindersEnabled,
  setRemindersEnabled,
} from '../../common/ReminderStorage';
import {
  cancelAllReminders,
  ensureNotificationPermissions,
  getBackgroundSetupCardCopy,
  getPermissionAlertCopy,
  getReminderSetupStatus,
  openBackgroundReminderSettings,
  openReminderPermissionSettings,
  rescheduleAllReminders,
} from '../../common/NotificationService';
import {
  buildDateKey,
  buildPillSections,
  getDaysInMonth,
  getWeekDaysForDate,
  getYearOptions,
  parseDateKeyParts,
  shiftDateKeyByDays,
} from '../../common/pillHelpers';
import useRevealOnFocus from '../../hooks/useRevealOnFocus';
import AnimatedReveal from '../../components/shared/AnimatedReveal';
import AddPillFab from '../../components/Program/AddPillFab';
import BackgroundSetupCard from '../../components/Program/BackgroundSetupCard';
import CalendarStrip from '../../components/Program/CalendarStrip';
import DatePickerModal from '../../components/Program/DatePickerModal';
import EmptyState from '../../components/Program/EmptyState';
import Header from '../../components/Program/Header';
import PillSection from '../../components/Program/PillSection';
import ProgramDateHeader from '../../components/Program/ProgramDateHeader';
import ReminderToggle from '../../components/Program/ReminderToggle';
import styles, { COLORS } from './styles';

const Program = () => {
  const navigation = useNavigation();
  const { activeProfileId } = useProfile();
  const [weekDays, setWeekDays] = useState(getWeekDaysForDate(getTodayDateKey()));
  const [sections, setSections] = useState([]);
  const [asNeededSection, setAsNeededSection] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());
  const [remindersEnabled, setRemindersEnabledState] = useState(true);
  const [needsBackgroundSetup, setNeedsBackgroundSetup] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [tempDay, setTempDay] = useState(1);
  const [tempMonth, setTempMonth] = useState(1);
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const revealKey = useRevealOnFocus();

  const loadPills = useCallback(async () => {
    const pills = await getPillsForProfile(activeProfileId);
    const takenIds = await getTakenDoseKeysForDate(selectedDate);
    const enabled = await getRemindersEnabled();

    setWeekDays(getWeekDaysForDate(selectedDate));
    const { sections: pillSections, asNeededSection: asNeeded } = buildPillSections(
      pills,
      COLORS,
      takenIds,
      selectedDate,
    );
    setSections(pillSections);
    setAsNeededSection(asNeeded);
    setRemindersEnabledState(enabled);

    const setupStatus = await getReminderSetupStatus();
    setNeedsBackgroundSetup(setupStatus.needsBackgroundSetup);
  }, [selectedDate, activeProfileId]);

  useFocusEffect(
    useCallback(() => {
      loadPills();
    }, [loadPills]),
  );

  useEffect(() => {
    loadPills();
  }, [selectedDate, loadPills]);

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

  const handleSelectMonth = monthValue => {
    setTempMonth(monthValue);
    const maxDay = getDaysInMonth(tempYear, monthValue);
    if (tempDay > maxDay) {
      setTempDay(maxDay);
    }
  };

  const handleSelectYear = year => {
    setTempYear(year);
    const maxDay = getDaysInMonth(year, tempMonth);
    if (tempDay > maxDay) {
      setTempDay(maxDay);
    }
  };

  const { takeDose, skipDose, snoozeDose } = useDoseActions(
    selectedDate,
    loadPills,
  );

  const handleToggleReminders = async () => {
    const newValue = !remindersEnabled;

    if (newValue) {
      const permissionResult = await ensureNotificationPermissions();

      if (!permissionResult.notificationsGranted) {
        const copy = getPermissionAlertCopy('notifications');
        Alert.alert(copy.title, copy.message, [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Ayarlara Git',
            onPress: () => openReminderPermissionSettings(),
          },
        ]);
        return;
      }

      if (!permissionResult.alarmGranted) {
        const copy = getPermissionAlertCopy('background');
        Alert.alert(copy.title, copy.message, [
          { text: 'Devam Et', style: 'cancel' },
          {
            text: 'Ayarlara Git',
            onPress: () => openBackgroundReminderSettings(),
          },
        ]);
      }
    }

    setRemindersEnabledState(newValue);
    await setRemindersEnabled(newValue);

    if (newValue) {
      await rescheduleAllReminders();
    } else {
      await cancelAllReminders();
    }
  };

  const handleOpenBackgroundSettings = () => {
    const copy = getPermissionAlertCopy('notifications');
    Alert.alert(copy.title, copy.message, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Ayarlara Git',
        onPress: () => openReminderPermissionSettings(),
      },
    ]);
  };

  const handleEditPill = item => {
    navigation.navigate('EditPill', { pillId: item.pill.id });
  };

  const handleAddPill = () => {
    navigation.navigate('AddPill');
  };

  const daysInMonth = getDaysInMonth(tempYear, tempMonth);
  const dayOptions = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const yearOptions = getYearOptions(tempYear);
  const hasPills = sections.length > 0 || asNeededSection?.items?.length > 0;

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
          <ProgramDateHeader
            selectedDate={selectedDate}
            onOpenCalendar={openDateModal}
            onPreviousDay={() => setSelectedDate(prev => shiftDateKeyByDays(prev, -1))}
            onNextDay={() => setSelectedDate(prev => shiftDateKeyByDays(prev, 1))}
          />
        </AnimatedReveal>

        <AnimatedReveal index={2} animationKey={revealKey}>
          <CalendarStrip weekDays={weekDays} onSelectDay={setSelectedDate} />
        </AnimatedReveal>

        <AnimatedReveal index={3} animationKey={revealKey}>
          <ReminderToggle
            enabled={remindersEnabled}
            onToggle={handleToggleReminders}
          />
        </AnimatedReveal>

        {needsBackgroundSetup && remindersEnabled && (
          <AnimatedReveal index={4} animationKey={revealKey}>
            <BackgroundSetupCard
              {...getBackgroundSetupCardCopy()}
              onPress={handleOpenBackgroundSettings}
            />
          </AnimatedReveal>
        )}

        {!hasPills ? (
          <AnimatedReveal index={5} animationKey={`${revealKey}-${selectedDate}`}>
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
                animationKey={`${revealKey}-${selectedDate}`}
                startIndex={5 + sectionIndex * 4}
              />
            ))}
            {asNeededSection && (
              <PillSection
                section={asNeededSection}
                onTake={takeDose}
                onSkip={skipDose}
                onSnooze={snoozeDose}
                onPressEdit={handleEditPill}
                animationKey={`${revealKey}-${selectedDate}`}
                startIndex={5 + sections.length * 4}
              />
            )}
          </>
        )}
      </ScrollView>

      <AddPillFab onPress={handleAddPill} />

      <DatePickerModal
        visible={dateModalVisible}
        dayOptions={dayOptions}
        yearOptions={yearOptions}
        tempDay={tempDay}
        tempMonth={tempMonth}
        tempYear={tempYear}
        onClose={() => setDateModalVisible(false)}
        onSelectDay={setTempDay}
        onSelectMonth={handleSelectMonth}
        onSelectYear={handleSelectYear}
        onGoToToday={goToToday}
        onConfirm={confirmDate}
      />
    </SafeAreaView>
  );
};

export default Program;
