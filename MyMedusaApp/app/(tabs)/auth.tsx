import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../src/state/AuthContext';
import { useBiometrics, BiometricAuthResult } from '../../src/hooks/useBiometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthScreen() {
  const { user, isLoggedIn, login, signup, logout, biometricsEnabled, setBiometricsEnabled } = useAuth();
  const { isSupported, isEnrolled, authenticate } = useBiometrics();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);

  // Check for saved email on component mount
  useEffect(() => {
    const checkSavedEmail = async () => {
      try {
        const email = await AsyncStorage.getItem('lastRegisteredEmail');
        setSavedEmail(email);
      } catch (error) {
        console.error("Error retrieving saved email:", error);
      }
    };
    checkSavedEmail();
  }, []);

  const handleAuth = async () => {
    setLoading(true);
    const success = mode === 'login'
      ? await login(email, password)
      : await signup(email, password);
    
    setLoading(false);
    
    if (!success) {
      Alert.alert('Error', 'Invalid credentials');
      return;
    }
    
    // Store email for future biometric login
    await AsyncStorage.setItem('lastRegisteredEmail', email);
    setSavedEmail(email);
    
    // If successful login and biometrics available, offer to enable
    if (mode === 'login' && isSupported && isEnrolled) {
      Alert.alert(
        'Enable Biometric Login?', 
        'Would you like to enable biometric login for future logins?', 
        [
          { text: 'No' },
          { text: 'Yes', onPress: () => setBiometricsEnabled(true) },
        ]
      );
    }
  };

  const handleBiometricLogin = async () => {
    const result = await authenticate('Login with biometrics');
    if (result === BiometricAuthResult.SUCCESS) {
      // Check if we have a saved email
      if (savedEmail) {
        const success = await login(savedEmail, 'biometric');
        if (!success) {
          Alert.alert('Error', 'Failed to log in using biometrics');
        }
      } else {
        Alert.alert('No user found', 'Please sign up or log in with email and password first.');
      }
    } else if (result === BiometricAuthResult.ERROR) {
      Alert.alert('Biometric login failed');
    }
  };

  if (isLoggedIn && user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {user.email}!</Text>
        <Button title="Logout" onPress={logout} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'login' ? 'Login' : 'Sign Up'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={mode === 'login' ? 'Login' : 'Sign Up'} onPress={handleAuth} disabled={loading} />
      <Button
        title={mode === 'login' ? 'Switch to Sign Up' : 'Switch to Login'}
        onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
      />
      {savedEmail && biometricsEnabled && isSupported && isEnrolled && (
        <Button title="Login with Biometrics" onPress={handleBiometricLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
}); 