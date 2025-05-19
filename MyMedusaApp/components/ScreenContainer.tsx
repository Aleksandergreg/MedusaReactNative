import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disableBottomInset?: boolean;
  backgroundColor?: string;
}

/**
 * A container component that properly handles safe area insets and tab bar spacing
 */
export default function ScreenContainer({ 
  children, 
  style, 
  disableBottomInset = false,
  backgroundColor = '#ffffff'
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding to avoid overlap with tab bar
  // The tab bar already includes the bottom inset, but we add extra padding for comfortable spacing
  const bottomInset = disableBottomInset ? 0 : Math.max(insets.bottom, 16);
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor,
          paddingBottom: bottomInset,
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 