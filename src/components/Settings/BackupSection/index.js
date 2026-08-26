import React, { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import {
  pickBackupFile,
  readLocalBackupFile,
  restoreBackup,
  shareBackup,
} from '../../../common/BackupService';
import { rescheduleAllReminders } from '../../../common/NotificationService';
import SettingsRow from '../SettingsRow';

const SAVE_HINT =
  Platform.OS === 'ios'
    ? 'Açılan ekranda “Dosyalara Kaydet” deyin. Uygulamayı sildikten sonra bu dosyayı seçerek geri yükleyebilirsiniz.'
    : 'Açılan ekranda İndirilenler veya Drive’a kaydedin. Uygulamayı sildikten sonra bu dosyayı seçerek geri yükleyebilirsiniz.';

const BackupSection = () => {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    try {
      const result = await shareBackup();
      if (result.action === 'cancelled') {
        return;
      }

      Alert.alert('Yedek dosyası hazır', SAVE_HINT);
    } catch (error) {
      Alert.alert(
        'Yedek alınamadı',
        'JSON dosyası paylaşılamadı. Uygulamayı yeniden derleyip tekrar deneyin.',
      );
    }
  };

  const applyRestore = async text => {
    try {
      setBusy(true);
      await restoreBackup(text);
      try {
        await rescheduleAllReminders();
      } catch (error) {
        console.warn('reschedule after restore failed:', error);
      }
      Alert.alert(
        'Yedek geri yüklendi',
        'İlaç listeniz ve alım geçmişiniz geri yüklendi.',
      );
    } catch (error) {
      const message = error?.message || '';
      if (message === 'EMPTY_BACKUP' || message === 'EMPTY_FILE') {
        Alert.alert(
          'Boş yedek',
          'Seçilen dosyada ilaç kaydı yok. İlaçlar kayıtlıyken Yedek al deyip oluşan JSON dosyasını seçin.',
        );
        return;
      }

      Alert.alert(
        'Yedek uygulanamadı',
        'ilac-takibi-yedek.json dosyasını seçin. Dosyayı Files, İndirilenler veya Drive içinden seçin.',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleRestorePress = async () => {
    if (busy) {
      return;
    }

    try {
      const picked = await pickBackupFile();
      if (!picked) {
        return;
      }

      Alert.alert(
        'Yedekten geri yükle',
        'Mevcut ilaç listeniz seçilen dosyadaki yedekle değiştirilecek. Devam edilsin mi?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Geri yükle',
            onPress: async () => {
              const stored = await readLocalBackupFile();
              await applyRestore(stored || picked);
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        'Dosya seçilemedi',
        'JSON dosyasını seçmek için uygulamayı yeniden derleyin.',
      );
    }
  };

  return (
    <View>
      <SettingsRow
        icon="upload"
        title="Yedek al"
        subtitle="JSON dosyasını Files, Drive veya İndirilenler’e kaydedin"
        onPress={handleExport}
      />
      <SettingsRow
        icon="download"
        title="Yedekten geri yükle"
        subtitle="Kayıtlı JSON dosyasını seçin"
        onPress={handleRestorePress}
      />
    </View>
  );
};

export default BackupSection;
