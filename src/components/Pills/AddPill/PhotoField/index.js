import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { pickPillPhoto } from '../../../../common/PhotoService';
import styles from '../ScheduleExtras/styles';

const PhotoField = ({ photoUri, onChange }) => {
  const [busy, setBusy] = useState(false);

  const handlePick = async () => {
    try {
      setBusy(true);
      const result = await pickPillPhoto();
      if (result?.path) {
        onChange(result.path);
      }
    } catch (error) {
      if (!/cancel/i.test(String(error?.code || error?.message || ''))) {
        Alert.alert(
          'Fotoğraf seçilemedi',
          'Galeri izni gerekir. Ayarlardan izin verip tekrar deneyin.',
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>İlaç fotoğrafı (Opsiyonel)</Text>
      <Text style={[styles.dateCaption, { marginBottom: 8 }]}>
        Kutu veya reçete görseli — karışmayı azaltır
      </Text>
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{
            width: '100%',
            height: 140,
            borderRadius: 12,
            marginBottom: 10,
            backgroundColor: '#E5E7EB',
          }}
          resizeMode="cover"
        />
      ) : null}
      <View style={styles.chipsWrap}>
        <TouchableOpacity style={styles.chip} onPress={handlePick} disabled={busy}>
          {busy ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={styles.chipText}>
              {photoUri ? 'Değiştir' : 'Galeriden seç'}
            </Text>
          )}
        </TouchableOpacity>
        {photoUri ? (
          <TouchableOpacity
            style={styles.chip}
            onPress={() => onChange('')}
          >
            <Text style={styles.chipText}>Kaldır</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default PhotoField;
