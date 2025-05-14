// src/hooks/useLocation.ts
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null;
  timestamp: number | null;
}

export enum LocationStatus {
  IDLE = 'IDLE',
  REQUESTING_PERMISSION = 'REQUESTING_PERMISSION',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  FETCHING = 'FETCHING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [status, setStatus] = useState<LocationStatus>(LocationStatus.IDLE); // Fixed
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null); // Fixed

  const requestPermission = async (): Promise<boolean> => {
    setStatus(LocationStatus.REQUESTING_PERMISSION);
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(foregroundStatus);

      if (foregroundStatus !== 'granted') {
        setStatus(LocationStatus.PERMISSION_DENIED);
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature. Please enable it in settings.',
          [ // Added options to the alert
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
      setStatus(LocationStatus.IDLE);
      return true;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setStatus(LocationStatus.ERROR);
      Alert.alert('Error', 'Failed to request location permission.');
      return false;
    }
  };

  const getCurrentLocation = async () => {
    if (permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    setStatus(LocationStatus.FETCHING);
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        altitude: currentLocation.coords.altitude,
        accuracy: currentLocation.coords.accuracy,
        speed: currentLocation.coords.speed,
        timestamp: currentLocation.timestamp,
      });
      setStatus(LocationStatus.SUCCESS);
    } catch (error: any) {
      console.error("Error fetching location:", error);
      setStatus(LocationStatus.ERROR);
      if (error.code === 'E_LOCATION_SETTINGS_UNSATISFIED') {
        Alert.alert('Location Services Disabled', 'Please enable location services for this app.');
      } else {
        Alert.alert('Error', 'Failed to fetch location.');
      }
      setLocation(null);
    }
  };

  useEffect(() => {
    const checkInitialPermission = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status !== 'granted') {
        // You might want to set status to IDLE or PERMISSION_DENIED based on your flow
        // For instance, if 'denied' you might immediately show PERMISSION_DENIED
        // If 'undetermined', IDLE is fine.
         setStatus(LocationStatus.IDLE);
      }
    };
    checkInitialPermission();
  }, []); // Fixed: Corrected dependency array

  return {
    location,
    status,
    permissionStatus,
    requestPermission,
    getCurrentLocation,
  };
};