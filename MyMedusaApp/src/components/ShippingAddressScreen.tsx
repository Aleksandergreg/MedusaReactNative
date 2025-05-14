// Example usage in a component (e.g., ShippingAddressScreen.tsx)
//src/componets/ShippingAddressScreen.tsx
import React from 'react';
import { View, Button, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocation, LocationStatus } from '../hooks/useLocation';

const ShippingAddressScreen = () => {
  const { location, status, permissionStatus, getCurrentLocation, requestPermission } = useLocation();

  const handlePrefillLocation = () => {
    getCurrentLocation();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>Location Permission: {permissionStatus || 'Checking...'}</Text>
<Text style={styles.statusText}>Fetch Status: {status}</Text>

          {status === LocationStatus.PERMISSION_DENIED && (
             <Button title="Grant Location Permission" onPress={requestPermission} />
          )}

          {(status === LocationStatus.IDLE || status === LocationStatus.SUCCESS || status === LocationStatus.ERROR) && permissionStatus === 'granted' && (
<Button title="Get Current Location for Prefill" onPress={handlePrefillLocation} />
)}

          {status === LocationStatus.FETCHING && <ActivityIndicator size="large" style={{marginTop: 20}} />}

          {status === LocationStatus.SUCCESS && location && (
            <View style={styles.locationInfo}>
              <Text>Latitude: {location.latitude.toFixed(4)}</Text>
              <Text>Longitude: {location.longitude.toFixed(4)}</Text>
              {/* TODO: Use these coordinates to prefill address fields, possibly via reverse geocoding */}
            </View>
          )}
           {status === LocationStatus.ERROR && (
             <Text style={styles.errorText}>Could not fetch location. Please try again or enter manually.</Text>
           )}
        </View>
      );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        statusText: {
            marginBottom: 10,
            fontSize: 16,
        },
        locationInfo: {
            marginTop: 20,
            padding: 15,
            backgroundColor: '#f0f0f0',
            borderRadius: 5,
        },
        errorText: {
            marginTop: 10,
            color: 'red',
            textAlign: 'center',
        }
    });

    export default ShippingAddressScreen;