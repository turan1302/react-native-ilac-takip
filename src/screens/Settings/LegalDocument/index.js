import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { getLegalDocument } from '../../../datas';
import AnimatedReveal from '../../../components/shared/AnimatedReveal';
import styles, { COLORS } from './styles';

const LegalDocument = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const document = getLegalDocument(route.params?.documentKey);

  if (!document) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Belge bulunamadı.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AnimatedReveal index={0} distance={12}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{document.title}</Text>
          </View>
        </AnimatedReveal>

        <AnimatedReveal index={1}>
          <Text style={styles.updatedText}>
            Son güncelleme: {document.lastUpdated}
          </Text>
        </AnimatedReveal>

        {document.sections.map((section, index) => (
          <AnimatedReveal key={section.title} index={index + 2}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          </AnimatedReveal>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LegalDocument;
