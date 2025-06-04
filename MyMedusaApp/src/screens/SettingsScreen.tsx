//src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Button, Text, Alert } from 'react-native';
import { useBiometrics, BiometricAuthResult } from '../hooks/useBiometrics';

const SettingsScreen = () => {
  const { isSupported, isEnrolled, authenticate } = useBiometrics();

  const handleEnableBiometrics = async () => {
    if (!isSupported) {
      Alert.alert('Feature Unavailable', 'Biometric authentication is not supported on this device.');
      return;
    }
    if (!isEnrolled) {
      Alert.alert('Setup Required', 'Please enroll biometrics in your device settings first.');
      return;
    }

    const result = await authenticate('Confirm to enable biometric login');

    if (result === BiometricAuthResult.SUCCESS) {
      Alert.alert('Success', 'Biometrics enabled!');

    } else if (result === BiometricAuthResult.CANCELLED) {
      console.log('Biometric authentication cancelled');
    } else {
      Alert.alert('Error', 'Biometric authentication failed.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text>Biometric Support: {isSupported? 'Available' : 'Not Available'}</Text>
      <Text>Biometrics Enrolled: {isEnrolled? 'Yes' : 'No'}</Text>
      {isSupported && isEnrolled && (
        <Button
          title="Enable/Test Biometric Authentication"
          onPress={handleEnableBiometrics}
        />
      )}
      {!isEnrolled && isSupported && (
         <Text style={{marginTop: 10, textAlign: 'center'}}>Please enroll Fingerprint/Face ID in your device settings to use this feature.</Text>
      )}
    </View>
  );
};

export default SettingsScreen;