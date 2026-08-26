import React, { useCallback } from 'react';
import { Alert, Platform, ScrollView, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useReminders from '../../hooks/useReminders';
import useRevealOnFocus from '../../hooks/useRevealOnFocus';
import AnimatedReveal from '../../components/shared/AnimatedReveal';
import ReminderToggle from '../../components/Program/ReminderToggle';
import AppVersionCard from '../../components/Settings/AppVersionCard';
import Header from '../../components/Settings/Header';
import SectionTitle from '../../components/Settings/SectionTitle';
import SettingsRow from '../../components/Settings/SettingsRow';
import FamilySection from '../../components/Settings/FamilySection';
import QuietHoursSection from '../../components/Settings/QuietHoursSection';
import BackupSection from '../../components/Settings/BackupSection';
import styles, { COLORS } from './styles';

const Settings = () => {
  const navigation = useNavigation();
  const { remindersEnabled, loadRemindersState, toggleReminders } = useReminders();
  const revealKey = useRevealOnFocus();

  useFocusEffect(
    useCallback(() => {
      loadRemindersState();
    }, [loadRemindersState]),
  );

  const openLegalDocument = documentKey => {
    navigation.navigate('LegalDocument', { documentKey });
  };

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
          <SectionTitle title="UYGULAMA" />
          <AppVersionCard />
          <SettingsRow
            icon="edit-3"
            title="Yan etki / not günlüğü"
            subtitle="Kısa kayıt bırakın, doktor ziyaretinde paylaşın"
            onPress={() => navigation.navigate('SymptomDiary')}
          />
        </AnimatedReveal>

        <AnimatedReveal index={2} animationKey={revealKey}>
          <SectionTitle title="AİLE MODU" />
          <FamilySection />
        </AnimatedReveal>

        <AnimatedReveal index={3} animationKey={revealKey}>
          <SectionTitle title="BİLDİRİMLER" />
          <ReminderToggle enabled={remindersEnabled} onToggle={toggleReminders} />
          <QuietHoursSection />
          <SettingsRow
            icon="grid"
            title="Ana ekran widget’ı"
            subtitle="Sıradaki ilaç ve tek dokunuşla Aldım"
            onPress={() =>
              Alert.alert(
                'Widget ekle',
                Platform.OS === 'ios'
                  ? 'Ana ekrana basılı tutun → Widget Ekle → İlaç Takibi → Sıradaki ilaç.'
                  : 'Ana ekrana basılı tutun → Widget’lar → İlaç Takibi.',
              )
            }
          />
        </AnimatedReveal>

        <AnimatedReveal index={4} animationKey={revealKey}>
          <SectionTitle title="YEDEKLEME" />
          <BackupSection />
        </AnimatedReveal>

        <AnimatedReveal index={5} animationKey={revealKey}>
          <SectionTitle title="YASAL" />
          <SettingsRow
            icon="shield"
            title="Gizlilik Politikası"
            subtitle="Verilerinizin nasıl korunduğunu öğrenin"
            onPress={() => openLegalDocument('privacyPolicy')}
          />
          <SettingsRow
            icon="file-text"
            title="KVKK Aydınlatma Metni"
            subtitle="Kişisel verilerin işlenmesi hakkında bilgi"
            onPress={() => openLegalDocument('kvkk')}
          />
        </AnimatedReveal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
