import React from 'react';
import { Text } from 'react-native';
import styles from './styles';

const PageIntro = () => (
  <>
    <Text style={styles.pageTitle}>Hatırlatmalar</Text>
    <Text style={styles.pageSubtitle}>
      Zamanı geçmiş ve henüz alınmamış ilaçlar burada görünür. Pas geçseniz bile
      zil ikonundaki sayaç, ilacı alana kadar görünmeye devam eder.
    </Text>
  </>
);

export default PageIntro;
