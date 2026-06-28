import React, { useCallback, useMemo, useState } from 'react';
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

const SECTION_TIME_RANGES = {
  sabah: '08:00 - 10:00',
  ogle: '12:00 - 14:00',
  aksam: '19:00 - 21:00',
};

const getMonthYearLabel = dateKey => {
  const { year, month } = parseDateKeyParts(dateKey);
  return `${MONTH_NAMES[month - 1]} ${year}`;
};

const formatTakenAt = isoString => {
  if (!isoString) {
    return '';
  }

  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}'te onaylandı`;
};

const getDetailText = item => {
  if (item.asNeeded) {
    return item.dosage;
  }

  const label = item.pill.notes?.trim() || item.dosage;
  return item.time ? `${label} • ${item.time}` : label;
};

const isPastScheduledTime = (timeStr, dateKey) => {
  const today = getTodayDateKey();

  if (dateKey < today) {
    return true;
  }

  if (dateKey > today || !timeStr) {
    return false;
  }

  const [hour, minute] = timeStr.split(':').map(Number);
  const now = new Date();

  return (
    now.getHours() > hour ||
    (now.getHours() === hour && now.getMinutes() >= minute)
  );
};

const getPillStatus = (item, dateKey, intakeMap) => {
  const intake = intakeMap.get(item.pill.id);

  if (intake?.taken) {
    return { status: 'taken', takenAt: intake.takenAt };
  }

  if (item.asNeeded) {
    if (dateKey < getTodayDateKey()) {
      return { status: 'skipped' };
    }

    return { status: 'pending' };
  }

  if (isPastScheduledTime(item.time, dateKey)) {
    return { status: 'skipped' };
  }

  return { status: 'pending' };
};

const calculateWeeklyCompliance = async (pills, endDateKey) => {
  let total = 0;
  let taken = 0;

  for (let offset = 6; offset >= 0; offset -= 1) {
    const dateKey = shiftDateKeyByDays(endDateKey, -offset);
    const intakeMap = await getIntakeMapForDate(dateKey);
    const takenIds = new Set(
      [...intakeMap.values()]
        .filter(report => report.taken)
        .map(report => report.pillId),
    );
    const { sections, asNeededSection } = buildPillSections(
      pills,
      COLORS,
      takenIds,
      dateKey,
    );
    const items = [
      ...sections.flatMap(section => section.items),
      ...(asNeededSection?.items || []),
    ];

    total += items.length;
    taken += items.filter(item => intakeMap.get(item.pill.id)?.taken).length;
  }

  return total > 0 ? Math.round((taken / total) * 100) : 0;
};

const MedCard = ({ item, statusInfo, onTake, onPressEdit }) => {
  const isPending = statusInfo.status === 'pending';
  const isSkipped = statusInfo.status === 'skipped';
  const isTaken = statusInfo.status === 'taken';

  return (
    <View style={[styles.medCard, isPending && styles.medCardPending]}>
      <TouchableOpacity
        style={styles.medCardPressable}
        onPress={() => onPressEdit(item)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.medCardAccent,
            isSkipped && styles.medCardAccentSkipped,
          ]}
        />
        <View style={styles.medIconWrapper}>
          <MaterialCommunityIcons
            name={item.icon}
            size={24}
            color={COLORS.primary}
          />
        </View>
        <View style={styles.medInfo}>
          <Text style={styles.medName}>{item.name}</Text>
          <Text style={styles.medDetail}>{getDetailText(item)}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.medAction}>
        {isTaken && (
          <>
            <View style={styles.takenBadge}>
              <Text style={styles.takenBadgeText}>Alındı</Text>
            </View>
            <Text style={styles.takenTimeText}>
              {formatTakenAt(statusInfo.takenAt)}
            </Text>
          </>
        )}

        {isSkipped && (
          <>
            <View style={styles.skippedBadge}>
              <Text style={styles.skippedBadgeText}>Atlandı</Text>
            </View>
            <TouchableOpacity onPress={() => onTake(item)} activeOpacity={0.7}>
              <Text style={styles.takeNowText}>Şimdi Al</Text>
            </TouchableOpacity>
          </>
        )}

        {isPending && (
          <TouchableOpacity
            style={styles.takeButton}
            onPress={() => onTake(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.takeButtonText}>Al</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

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
    const compliance = await calculateWeeklyCompliance(pills, selectedDate);

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

  const daysInMonth = getDaysInMonth(tempYear, tempMonth);
  const dayOptions = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const yearOptions = getYearOptions(tempYear);
  const hasPills = totalCount > 0;

  const renderSection = section => (
    <View key={section.id}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: section.color }]}>
          {section.title}
        </Text>
        {SECTION_TIME_RANGES[section.id] && (
          <Text style={styles.sectionTimeRange}>
            {SECTION_TIME_RANGES[section.id]}
          </Text>
        )}
      </View>

      {section.items.map(item => (
        <MedCard
          key={item.id}
          item={item}
          statusInfo={getPillStatus(item, selectedDate, intakeMap)}
          onTake={handleTake}
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
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Feather name="search" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.pageTitle}>Günlük Kayıt</Text>
        <Text style={styles.pageSubtitle}>
          İlaç geçmişinizi ve uyum oranınızı buradan takip edebilirsiniz.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>BUGÜN UYUM</Text>
            <Text style={styles.statValue}>%{todayCompliance}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOPLAM ALINAN</Text>
            <Text style={styles.statValue}>
              {takenCount}
              <Text style={styles.statUnit}> Doz</Text>
            </Text>
          </View>
        </View>

        <View style={styles.calendarHeader}>
          <Text style={styles.calendarMonth}>
            {getMonthYearLabel(selectedDate)}
          </Text>
          <TouchableOpacity
            style={styles.calendarLink}
            onPress={openDateModal}
            activeOpacity={0.7}
          >
            <Feather name="calendar" size={14} color={COLORS.primary} />
            <Text style={styles.calendarLinkText}>Takvim</Text>
          </TouchableOpacity>
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
                {day.active && <View style={styles.calendarDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {!hasPills ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Bu gün için kayıt yok</Text>
            <Text style={styles.emptyText}>
              Seçili tarihte planlanmış ilaç bulunmuyor.
            </Text>
          </View>
        ) : (
          <>
            {sections.map(renderSection)}
            {asNeededSection && renderSection(asNeededSection)}
          </>
        )}

        <View style={styles.motivationCard}>
          <View style={styles.motivationIcon}>
            <Feather name="check-circle" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.motivationContent}>
            <Text style={styles.motivationTitle}>Harika Gidiyorsunuz!</Text>
            <Text style={styles.motivationText}>
              Son 7 günlük ilaç uyumunuz %{weeklyCompliance}. Sağlığınız için
              böyle devam edin.
            </Text>
          </View>
        </View>
      </ScrollView>

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

              <View style={styles.pickerRow}>
                <ScrollView
                  style={styles.pickerColumn}
                  showsVerticalScrollIndicator={false}
                >
                  {dayOptions.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        tempDay === day && styles.pickerItemActive,
                      ]}
                      onPress={() => setTempDay(day)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          tempDay === day && styles.pickerItemTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <ScrollView
                  style={styles.pickerColumn}
                  showsVerticalScrollIndicator={false}
                >
                  {MONTH_NAMES.map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.pickerItem,
                        tempMonth === index + 1 && styles.pickerItemActive,
                      ]}
                      onPress={() => setTempMonth(index + 1)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          tempMonth === index + 1 && styles.pickerItemTextActive,
                        ]}
                      >
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <ScrollView
                  style={styles.pickerColumn}
                  showsVerticalScrollIndicator={false}
                >
                  {yearOptions.map(year => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        tempYear === year && styles.pickerItemActive,
                      ]}
                      onPress={() => setTempYear(year)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          tempYear === year && styles.pickerItemTextActive,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={goToToday}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      styles.modalButtonTextSecondary,
                    ]}
                  >
                    Bugün
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={confirmDate}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalButtonText}>Tamam</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default Daily;
