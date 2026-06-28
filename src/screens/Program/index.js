import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
  buildDateKey,
  buildPillSections,
  formatDateLabel,
  getDaysInMonth,
  getWeekDaysForDate,
  getYearOptions,
  parseDateKeyParts,
  shiftDateKeyByDays,
} from '../../common/pillHelpers';
import styles, { COLORS } from './styles';

const MONTH_NAMES = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

const MedCard = ({ item, onToggleTaken, onPressEdit }) => (
  <View style={styles.medCard}>
    <TouchableOpacity
      style={styles.medCardPressable}
      onPress={() => onPressEdit(item)}
      activeOpacity={0.7}
    >
      <View style={styles.medCardAccent} />
      <View style={styles.medIconWrapper}>
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.medInfo}>
        <Text style={styles.medName}>{item.name}</Text>
        <Text style={styles.medDetail}>
          {item.asNeeded ? item.dosage : `${item.time} • ${item.dosage}`}
        </Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.medCheckbox, item.isTaken && styles.medCheckboxTaken]}
      onPress={() => onToggleTaken(item)}
      activeOpacity={0.7}
    >
      {item.isTaken && <Feather name="check" size={16} color={COLORS.white} />}
    </TouchableOpacity>
  </View>
);

const Program = () => {
  const navigation = useNavigation();
  const [weekDays, setWeekDays] = useState(getWeekDaysForDate(getTodayDateKey()));
  const [sections, setSections] = useState([]);
  const [asNeededSection, setAsNeededSection] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());
  const [remindersEnabled, setRemindersEnabledState] = useState(true);
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
    const dateKey = buildDateKey({
      year: tempYear,
      month: tempMonth,
      day: tempDay,
    });
    setSelectedDate(dateKey);
    setDateModalVisible(false);
  };

  const goToToday = () => {
    setSelectedDate(getTodayDateKey());
    setDateModalVisible(false);
  };

  const handleToggleTaken = async item => {
    const newTaken = !item.isTaken;
    await togglePillIntake(item.pill, selectedDate, newTaken);
    await loadPills();
  };

  const handleToggleReminders = async () => {
    const newValue = !remindersEnabled;
    setRemindersEnabledState(newValue);
    await setRemindersEnabled(newValue);
  };

  const handlePreviousDay = () => {
    setSelectedDate(prev => shiftDateKeyByDays(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => shiftDateKeyByDays(prev, 1));
  };

  const handleSelectDay = dateKey => {
    setSelectedDate(dateKey);
  };

  const handleAddPill = () => {
    navigation.navigate('AddPill');
  };

  const handleEditPill = item => {
    navigation.navigate('EditPill', { pillId: item.pill.id });
  };

  const daysInMonth = getDaysInMonth(tempYear, tempMonth);
  const dayOptions = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const yearOptions = getYearOptions(tempYear);

  const hasPills = sections.length > 0 || asNeededSection?.items?.length > 0;

  const renderSection = section => (
    <View key={section.id}>
      <View style={styles.sectionHeader}>
        <Feather name={section.icon} size={14} color={section.color} />
        <Text style={[styles.sectionTitle, { color: section.color }]}>
          {section.title}
        </Text>
      </View>

      {section.items.map(item => (
        <MedCard
          key={item.id}
          item={item}
          onToggleTaken={handleToggleTaken}
          onPressEdit={handleEditPill}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerPillIcon}>
              <MaterialCommunityIcons name="pill" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>
              <Text style={styles.headerTitleAccent}>İlaç </Text>
              Takibi
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
            <Feather name="bell" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.programHeader}>
          <TouchableOpacity
            style={styles.programTitleWrap}
            onPress={openDateModal}
            activeOpacity={0.7}
          >
            <Text style={styles.programTitle}>Program</Text>
            <Text style={styles.programSubtitle}>
              {formatDateLabel(selectedDate)}
            </Text>
          </TouchableOpacity>
          <View style={styles.programNav}>
            <TouchableOpacity
              style={styles.navButton}
              activeOpacity={0.7}
              onPress={handlePreviousDay}
            >
              <Feather name="chevron-left" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              activeOpacity={0.7}
              onPress={openDateModal}
            >
              <Feather name="calendar" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              activeOpacity={0.7}
              onPress={handleNextDay}
            >
              <Feather name="chevron-right" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.calendarRow}>
            {weekDays.map(day => (
              <TouchableOpacity
                key={day.key}
                style={styles.calendarDay}
                onPress={() => handleSelectDay(day.dateKey)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.calendarDayLabel,
                    day.active && styles.calendarDayLabelActive,
                  ]}
                >
                  {day.day}
                </Text>
                <View
                  style={[
                    styles.calendarDate,
                    day.active && styles.calendarDateActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDateText,
                      day.active && styles.calendarDateTextActive,
                    ]}
                  >
                    {day.date}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.reminderCard}>
          <View style={styles.reminderIconWrapper}>
            <Feather name="bell" size={20} color={COLORS.reminderIcon} />
          </View>
          <View style={styles.reminderTextWrapper}>
            <Text style={styles.reminderTitle}>Hatırlatıcılar</Text>
            <Text style={styles.reminderSubtitle}>
              {remindersEnabled
                ? 'Tüm bildirimler açık'
                : 'Tüm bildirimler kapalı'}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.switchTrack,
              !remindersEnabled && styles.switchTrackOff,
            ]}
            onPress={handleToggleReminders}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.switchThumb,
                !remindersEnabled && styles.switchThumbOff,
              ]}
            />
          </TouchableOpacity>
        </View>

        {!hasPills ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Henüz ilaç eklenmedi</Text>
            <Text style={styles.emptyText}>
              İlaçlarınızı ekleyerek günlük programınızı burada
              görüntüleyebilirsiniz.
            </Text>
          </View>
        ) : (
          <>
            {sections.map(renderSection)}
            {asNeededSection && renderSection(asNeededSection)}
          </>
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={handleAddPill}
        >
          <Feather name="plus" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={dateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDateModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Tarih Seçin</Text>

              <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
                <Text style={styles.todayButtonText}>Bugüne Git</Text>
              </TouchableOpacity>

              <View style={styles.datePickerRow}>
                <ScrollView
                  style={styles.datePickerColumn}
                  showsVerticalScrollIndicator={false}
                >
                  {dayOptions.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.datePickerItem,
                        tempDay === day && styles.datePickerItemActive,
                      ]}
                      onPress={() => setTempDay(day)}
                    >
                      <Text
                        style={[
                          styles.datePickerItemText,
                          tempDay === day && styles.datePickerItemTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <ScrollView
                  style={styles.datePickerColumn}
                  showsVerticalScrollIndicator={false}
                >
                  {MONTH_NAMES.map((month, index) => {
                    const monthValue = index + 1;

                    return (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.datePickerItem,
                          tempMonth === monthValue &&
                            styles.datePickerItemActive,
                        ]}
                        onPress={() => {
                          setTempMonth(monthValue);
                          const maxDay = getDaysInMonth(tempYear, monthValue);
                          if (tempDay > maxDay) {
                            setTempDay(maxDay);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.datePickerItemText,
                            tempMonth === monthValue &&
                              styles.datePickerItemTextActive,
                          ]}
                        >
                          {month}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <ScrollView
                  style={styles.datePickerColumn}
                  showsVerticalScrollIndicator={false}
                >
                  {yearOptions.map(year => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.datePickerItem,
                        tempYear === year && styles.datePickerItemActive,
                      ]}
                      onPress={() => {
                        setTempYear(year);
                        const maxDay = getDaysInMonth(year, tempMonth);
                        if (tempDay > maxDay) {
                          setTempDay(maxDay);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.datePickerItemText,
                          tempYear === year && styles.datePickerItemTextActive,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmDate}
                activeOpacity={0.85}
              >
                <Text style={styles.modalConfirmButtonText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default Program;
