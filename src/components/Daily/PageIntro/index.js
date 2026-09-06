import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../../common/ThemeContext';
import styles from './styles';

const PageIntro = () => {
  const { colors } = useTheme();

  return (
    <>
      <Text style={[styles.pageTitle, { color: colors.text }]}>Günlük Kayıt</Text>
      <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
        İlaç geçmişinizi ve uyum oranınızı buradan takip edebilirsiniz
      </Text>
    </>
  );
};

export default PageIntro;
