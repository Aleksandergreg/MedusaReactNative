import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCart } from '../../src/state/CartContext';

// Define a standard tab bar height for calculations
const TAB_BAR_HEIGHT = 60;

function CartTabIcon({ color, focused }: { color: string, focused: boolean }) {
  const { cartItems } = useCart();
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <View style={styles.tabIconContainer}>
      <IconSymbol size={28} name="cart.fill" color={color} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
      {focused && <View style={[styles.activeIndicator, { backgroundColor: color }]} />}
    </View>
  );
}

function TabBarIcon({ name, color, focused }: { name: any, color: string, focused: boolean }) {
  return (
    <View style={styles.tabIconContainer}>
      <IconSymbol size={28} name={name} color={color} />
      {focused && <View style={[styles.activeIndicator, { backgroundColor: color }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  activeIndicator: {
    height: 4,
    width: 20,
    borderRadius: 2,
    marginTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColor = Colors[colorScheme ?? 'light'].tabIconSelected;
  const inactiveColor = Colors[colorScheme ?? 'light'].tabIconDefault;
  const insets = useSafeAreaInsets();

  // Calculate the actual tab bar height including insets for bottom padding
  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            height: tabBarHeight,
            paddingBottom: insets.bottom,
          },
          default: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            elevation: 8,
            borderTopWidth: 1,
            borderTopColor: '#e1e1e1',
            height: tabBarHeight,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          },
        }),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="house.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="bag.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <CartTabIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="person.crop.circle" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="minigame"
        options={{
          title: 'Mini Game',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="gamecontroller.fill" color={color} focused={focused} />
          ),
        }}
      />
      
      {/* Hidden screens - these screens exist but won't show in the tab bar */}
      <Tabs.Screen
        name="auth"
        options={{
          href: null, // Prevents the tab from being accessible via the tab bar
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="shipping-address"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
