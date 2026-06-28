import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StatusBar, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPills } from '../../common/PillStorage';
import {
  getTakenPillIdsForDate,
  getTodayDateKey,
  togglePillIntake,
} from '../../common/IntakeStorage';
import {
  getRemindersEnabled,
  setRemindersEnabled,
} from '../../common/ReminderStorage';
import {
  cancelAllReminders,
  ensureNotificationPermissions,
  getReminderSetupStatus,
  openBackgroundReminderSettings,
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

  const loadPills = useCallback(async () => {
    const pills = await getPills();
    const takenIds = await getTakenPillIdsForDate(selectedDate);
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
  }, [selectedDate]);

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

  const handleToggleTaken = async item => {
    await togglePillIntake(item.pill, selectedDate, !item.isTaken);
    await loadPills();
  };

  const handleToggleReminders = async () => {
    const newValue = !remindersEnabled;

    if (newValue) {
      const permissionResult = await ensureNotificationPermissions();

      if (!permissionResult.notificationsGranted) {
        Alert.alert(
          'Bildirim İzni Gerekli',
          'Hatırlatıcıları açmak için bildirim iznine ihtiyacımız var.',
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Ayarlara Git',
              onPress: () => openBackgroundReminderSettings(),
            },
          ],
        );
        return;
      }

      if (!permissionResult.alarmGranted) {
        Alert.alert(
          'Arka Plan Hatırlatıcı İzni',
          'Uygulama kapalıyken bildirim için pil tasarrufu ve otomatik başlatma izinlerini açın. "Alarmlar ve hatırlatıcılar" listesinde görünmüyorsa önce ilaç ekleyip hatırlatıcıyı açın.',
          [
            { text: 'Devam Et', style: 'cancel' },
            {
              text: 'Ayarlara Git',
              onPress: () => openBackgroundReminderSettings(),
            },
          ],
        );
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
    Alert.alert(
      'Arka Plan İzinleri',
      'Sırasıyla açılan ekranlarda:\n\n1. Alarmlar ve hatırlatıcılar → İlaç Takibi\'ni açın (listede yoksa ilaç ekleyip uygulamayı yeniden açın)\n2. Pil tasarrufu → Kısıtlama yok\n3. Otomatik başlatma → Açık (Xiaomi/Redmi)',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Ayarlara Git',
          onPress: () => openBackgroundReminderSettings(),
        },
      ],
    );
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
        <Header />

        <ProgramDateHeader
          selectedDate={selectedDate}
          onOpenCalendar={openDateModal}
          onPreviousDay={() => setSelectedDate(prev => shiftDateKeyByDays(prev, -1))}
          onNextDay={() => setSelectedDate(prev => shiftDateKeyByDays(prev, 1))}
        />

        <CalendarStrip weekDays={weekDays} onSelectDay={setSelectedDate} />

        <ReminderToggle
          enabled={remindersEnabled}
          onToggle={handleToggleReminders}
        />

        {needsBackgroundSetup && remindersEnabled && (
          <BackgroundSetupCard onPress={handleOpenBackgroundSettings} />
        )}

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
