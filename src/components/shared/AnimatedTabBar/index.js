import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Platform, Pressable, View } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles';

const HIDDEN_ROUTES = ['AddPill', 'EditPill', 'LegalDocument'];

const AnimatedTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const indicatorX = useRef(new Animated.Value(0)).current;
  const [tabWidth, setTabWidth] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const didInit = useRef(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (!tabWidth) {
      return;
    }

    const toValue = state.index * tabWidth;

    if (!didInit.current) {
      indicatorX.setValue(toValue);
      didInit.current = true;
      return;
    }

    Animated.spring(indicatorX, {
      toValue,
      useNativeDriver: true,
      friction: 7,
      tension: 72,
    }).start();
  }, [indicatorX, state.index, tabWidth]);

  const focusedRoute = state.routes[state.index];
  const nestedName = getFocusedRouteNameFromRoute(focusedRoute);
  const hidden = HIDDEN_ROUTES.includes(nestedName) || keyboardVisible;

  if (hidden) {
    return null;
  }

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 10);

  return (
    <View style={[styles.bar, { paddingBottom: bottomInset, height: 64 + bottomInset }]}>
      <View
        style={styles.track}
        onLayout={event => {
          const width = event.nativeEvent.layout.width;
          setTabWidth(width / state.routes.length);
        }}
      >
        {tabWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                width: tabWidth - 10,
                marginLeft: 5,
                transform: [{ translateX: indicatorX }],
              },
            ]}
          />
        ) : null}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.item}
            >
              {options.tabBarIcon?.({ focused, color: '', size: 22 })}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default AnimatedTabBar;
