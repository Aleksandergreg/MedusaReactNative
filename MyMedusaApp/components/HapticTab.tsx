import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function HapticTab(props: BottomTabBarButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <PlatformPressable
      {...props}
      style={[
        styles.tabButton,
        Platform.OS === 'android' ? {
          paddingBottom: insets.bottom > 0 ? 0 : undefined,
        } : undefined,
        props.style
      ]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    paddingVertical: 10,
  },
}); 