import React from 'react';
import { Text } from 'react-native';
import styles from './styles';

const PageIntro = () => (
  <>
    <Text style={styles.pageTitle}>Günlük Kayıt</Text>
    <Text style={styles.pageSubtitle}>
      İlaç geçmişinizi ve uyum oranınızı buradan takip edebilirsiniz.
    </Text>
  </>
);

export default PageIntro;
