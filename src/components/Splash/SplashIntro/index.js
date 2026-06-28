import React from 'react';
import { Text } from 'react-native';
import styles from './styles';

const SplashIntro = () => (
  <>
    <Text style={styles.title}>İlaç Takip</Text>
    <Text style={styles.subtitle}>
      İlaçlarınızı kaydedin, dozajlarınızı ayarlayın ve zamanında alın.
    </Text>
  </>
);

export default SplashIntro;
