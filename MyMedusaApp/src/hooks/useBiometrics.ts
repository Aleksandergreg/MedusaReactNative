// src/hooks/useBiometrics.ts
import * as LocalAuthentication from 'expo-local-authentication';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

export enum BiometricAuthResult {
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  NOT_ENROLLED = 'NOT_ENROLLED',
  SUCCESS = 'SUCCESS',
  CANCELLED = 'CANCELLED',
  ERROR = 'ERROR',
}

export const useBiometrics = () => {
  const [isSupported, setIsSupported] = useState(false); 
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const hardwareSupported = await LocalAuthentication.hasHardwareAsync();
      setIsSupported(hardwareSupported);
      if (hardwareSupported) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);
      }
    };
    checkSupport();
  }, []); 

  const authenticate = async (promptMessage: string = 'Authenticate'): Promise<BiometricAuthResult> => {
    if (!isSupported) {
      Alert.alert('Biometrics not supported on this device.');
      return BiometricAuthResult.NOT_SUPPORTED;
    }

    if (!isEnrolled) {
      Alert.alert('No biometrics enrolled on this device.');
      return BiometricAuthResult.NOT_ENROLLED;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage,
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
      });

      if (result.success) {
        return BiometricAuthResult.SUCCESS;
      } else if (result.error === 'user_cancel' || result.error === 'system_cancel' || result.error === 'app_cancel') {
        return BiometricAuthResult.CANCELLED;
      } else {
        Alert.alert('Authentication failed', result.error || 'An unknown error occurred.');
        return BiometricAuthResult.ERROR;
      }
    } catch (error: any) {
      Alert.alert('Authentication error', error?.message || 'An unexpected error occurred.');
      return BiometricAuthResult.ERROR;
    }
  };

  return {
    isSupported,
    isEnrolled,
    authenticate,
  };
};