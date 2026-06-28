import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PlaceholderScreen = ({ title }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.title}>{title}</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export const AnaSayfa = () => <PlaceholderScreen title="Ana Sayfa" />;
export const Gunluk = () => <PlaceholderScreen title="Günlük" />;
export const Ayarlar = () => <PlaceholderScreen title="Ayarlar" />;
