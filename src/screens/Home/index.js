import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
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
import { buildPillSections, formatDateLabel } from '../../common/pillHelpers';
import styles, { COLORS } from './styles';

const DAY_NAMES_FULL = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
];

const formatTodaySubtitle = () => {
  const today = new Date();
  const dateLabel = formatDateLabel(getTodayDateKey());
  const dayName = DAY_NAMES_FULL[today.getDay()];
  return `${dateLabel.split(' ').slice(0, 2).join(' ')} ${dayName}`;
};

const ProgressRing = ({ percent }) => (
  <View style={styles.progressRing}>
    <View
      style={[
        styles.progressArc,
        { transform: [{ rotate: `${-90 + (percent / 100) * 360}deg` }] },
      ]}
    />
    <Text style={styles.progressText}>{percent}%</Text>
  </View>
);

const MedCard = ({ item, onToggleTaken, onPressEdit }) => (
  <View style={[styles.medCard, item.isTaken && styles.medCardTaken]}>
    <TouchableOpacity
      style={styles.medCardPressable}
      onPress={() => onPressEdit(item)}
      activeOpacity={0.7}
    >
      <View style={styles.medCardAccent} />
      <View
        style={[
          styles.medIconWrapper,
          item.isTaken && styles.medIconWrapperTaken,
        ]}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={item.isTaken ? COLORS.textMuted : COLORS.primary}
        />
      </View>
      <View style={styles.medInfo}>
        <Text style={[styles.medName, item.isTaken && styles.medNameTaken]}>
          {item.name}
        </Text>
        <Text style={[styles.medDetail, item.isTaken && styles.medDetailTaken]}>
          {item.asNeeded ? item.dosage : `${item.time} • ${item.dosage}`}
        </Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.medCheckbox, item.isTaken && styles.medCheckboxTaken]}
      onPress={() => onToggleTaken(item)}
      activeOpacity={0.7}
    >
      {item.isTaken && (
        <MaterialCommunityIcons name="check-all" size={16} color={COLORS.white} />
      )}
    </TouchableOpacity>
  </View>
);

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

  const renderSection = section => (
    <View key={section.id}>
      <View style={styles.timeSectionHeader}>
        <Feather name={section.icon} size={14} color={section.color} />
        <Text style={[styles.timeSectionTitle, { color: section.color }]}>
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

  const hasPills = totalCount > 0;

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

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Feather name="bell" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryTitle}>Bugün</Text>
              <Text style={styles.summaryDate}>{formatTodaySubtitle()}</Text>
            </View>
            <ProgressRing percent={progressPercent} />
          </View>

          <View style={styles.summaryBanner}>
            <View style={styles.summaryBannerIcon}>
              <Feather name="check-circle" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.summaryBannerTextWrap}>
              <Text style={styles.summaryBannerText}>
                {totalCount > 0
                  ? `${totalCount} dozdan ${takenCount}'ü alındı`
                  : 'Bugün için planlanmış ilaç yok'}
              </Text>
              <Text style={styles.summaryBannerHighlight}>
                {progressPercent >= 100
                  ? 'Tebrikler, tamamlandı!'
                  : progressPercent >= 50
                    ? 'Harika Gidiyorsun!'
                    : 'Devam edin!'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionListTitle}>GELECEK İLAÇLAR</Text>
          <TouchableOpacity onPress={handleSeeAll} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>

        {!hasPills ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Bugün için ilaç yok</Text>
            <Text style={styles.emptyText}>
              İlaç ekleyerek günlük programınızı oluşturabilirsiniz.
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
    </SafeAreaView>
  );
};

export default Home;
