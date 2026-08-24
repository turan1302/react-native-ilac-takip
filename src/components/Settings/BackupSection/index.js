import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { restoreBackup, shareBackup } from '../../../common/BackupService';
import { rescheduleAllReminders } from '../../../common/NotificationService';
import SettingsRow from '../SettingsRow';
import styles from './styles';

const BackupSection = () => {
  const insets = useSafeAreaInsets();
  const [importVisible, setImportVisible] = useState(false);
  const [importText, setImportText] = useState('');
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    try {
      await shareBackup();
    } catch (error) {
      Alert.alert('Yedek alınamadı', 'Paylaşım iptal edildi veya bir hata oluştu.');
    }
  };

  const handleImport = async () => {
    try {
      setBusy(true);
      await restoreBackup(importText);
      await rescheduleAllReminders();
      setImportVisible(false);
      setImportText('');
      Alert.alert(
        'Yedek geri yüklendi',
        'İlaç listeniz ve alım geçmişiniz geri yüklendi.',
      );
    } catch (error) {
      Alert.alert(
        'Geçersiz yedek',
        'Yapıştırdığınız metin İlaç Takibi yedeği değil. Dışa aktardığınız metnin tamamını kopyalayın.',
      );
    } finally {
      setBusy(false);
    }
  };

  const confirmImport = () => {
    Alert.alert(
      'Yedekten geri yükle',
      'Mevcut ilaç listeniz bu yedekle değiştirilecek. Devam edilsin mi?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Geri yükle', onPress: handleImport },
      ],
    );
  };

  return (
    <View>
      <SettingsRow
        icon="upload"
        title="Yedek al"
        subtitle="İlaç listesi ve alım geçmişini dosya olarak paylaşın"
        onPress={handleExport}
      />
      <SettingsRow
        icon="download"
        title="Yedekten geri yükle"
        subtitle="Başka telefondan aldığınız yedeği yapıştırın"
        onPress={() => setImportVisible(true)}
      />

      <Modal
        visible={importVisible}
        animationType="slide"
        onRequestClose={() => setImportVisible(false)}
      >
        <View style={[styles.modal, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.modalTitle}>Yedekten geri yükle</Text>
          <Text style={styles.modalHint}>
            Dışa aktardığınız metnin tamamını, ---JSON--- satırı dahil yapıştırın.
          </Text>
          <TextInput
            style={styles.input}
            multiline
            value={importText}
            onChangeText={setImportText}
            placeholder="Yedek metnini yapıştırın"
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={confirmImport}
            disabled={busy || !importText.trim()}
          >
            <Text style={styles.primaryButtonText}>Geri yükle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setImportVisible(false)}
          >
            <Text style={styles.secondaryButtonText}>Vazgeç</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default BackupSection;
