// app/_layout.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from '../src/state/CartContext';
import { AuthProvider } from '../src/state/AuthContext';
import { Slot } from 'expo-router';
// Import FontAwesome or other icons if needed for headers, etc.

// You might also import global CSS or providers here

export default function RootLayout() {
  // Note: NavigationContainer is often handled implicitly by Expo Router layouts
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <Slot />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}