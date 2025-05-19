import React from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/ScreenContainer';

const HomeScreen = () => {
  const router = useRouter();
  return (
    <ScreenContainer style={styles.container}>
      <Image
        source={{ uri: 'https://medusajs.com/static/medusa-logo.svg' }}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome to Medusa Mobile Shop!</Text>
      <Text style={styles.subtitle}>
        Discover amazing products, add them to your cart, and enjoy a seamless shopping experience.
      </Text>
      <Text style={styles.body}>
        Navigate around, find the products you love, and buy them with ease. Tap below to start exploring our catalog!
      </Text>
      <Button
        title="Browse Products"
        onPress={() => router.push('/(tabs)/products')}
        color="#007AFF"
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
});

export default HomeScreen; 