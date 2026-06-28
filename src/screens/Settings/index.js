import React, { useCallback } from 'react';
import { ScrollView, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useReminders from '../../hooks/useReminders';
import ReminderToggle from '../../components/Program/ReminderToggle';
import AppVersionCard from '../../components/Settings/AppVersionCard';
import Header from '../../components/Settings/Header';
import SectionTitle from '../../components/Settings/SectionTitle';
import SettingsRow from '../../components/Settings/SettingsRow';
import styles, { COLORS } from './styles';

const Settings = () => {
  const navigation = useNavigation();
  const { remindersEnabled, loadRemindersState, toggleReminders } = useReminders();

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
        <Header />

        <SectionTitle title="UYGULAMA" />
        <AppVersionCard />

        <SectionTitle title="BİLDİRİMLER" />
        <ReminderToggle enabled={remindersEnabled} onToggle={toggleReminders} />

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
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
