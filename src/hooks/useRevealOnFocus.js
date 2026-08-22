import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const useRevealOnFocus = () => {
  const [revealKey, setRevealKey] = useState(1);
  const isFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }

      setRevealKey(current => current + 1);
    }, []),
  );

  return revealKey;
};

export default useRevealOnFocus;
