// app/_layout.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from '../src/state/CartContext';
import { AuthProvider } from '../src/state/AuthContext';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Import FontAwesome or other icons if needed for headers, etc.

// You might also import global CSS or providers here

export default function RootLayout() {
  // Note: NavigationContainer is often handled implicitly by Expo Router layouts
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <Slot />
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});