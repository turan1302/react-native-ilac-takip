import React from 'react';
import { Image } from 'react-native';
import appIcon from '../../../assets/branding/app-icon.png';
import styles from './styles';

const PillLogo = () => (
  <Image source={appIcon} style={styles.logo} accessibilityLabel="İlaç Takibi" />
);

export default PillLogo;
