import React, { useState } from 'react';
import { View, Button, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocation, LocationStatus } from '../hooks/useLocation';

const OPENCAGE_API_KEY = '04a501ae949f498594ce3be8aaa71bbf';

const ShippingAddressScreen = () => {
  const { location, status, permissionStatus, getCurrentLocation, requestPermission } = useLocation();
  const [address, setAddress] = useState<string | null>(null);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const handlePrefillLocation = async () => {
    setAddress(null);
    setAddressError(null);
    await getCurrentLocation();
  };

  React.useEffect(() => {
    const fetchAddress = async () => {
      if (location) {
        setFetchingAddress(true);
        setAddressError(null);
        try {
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${location.latitude}+${location.longitude}&key=${OPENCAGE_API_KEY}`
          );
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            setAddress(data.results[0].formatted);
          } else {
            setAddressError('No address found for this location.');
          }
        } catch (err) {
          setAddressError('Failed to fetch address.');
        } finally {
          setFetchingAddress(false);
        }
      }
    };
    if (status === LocationStatus.SUCCESS && location) {
      fetchAddress();
    }
  }, [location, status]);

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
          {fetchingAddress && <ActivityIndicator size="small" style={{marginTop: 10}} />}
          {address && <Text style={styles.addressText}>Address: {address}</Text>}
          {addressError && <Text style={styles.errorText}>{addressError}</Text>}
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
    alignItems: 'center',
  },
  addressText: {
    marginTop: 10,
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 10,
    color: 'red',
    textAlign: 'center',
  }
});

export default ShippingAddressScreen; 