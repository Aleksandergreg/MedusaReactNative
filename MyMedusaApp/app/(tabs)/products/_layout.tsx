import { Stack } from 'expo-router';
import React from 'react';

export default function ProductsStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Products' }} />
      <Stack.Screen name="product-details" options={{ title: 'Product Details' }} />
    </Stack>
  );
} 