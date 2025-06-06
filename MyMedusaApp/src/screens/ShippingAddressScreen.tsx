import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../state/AuthContext';

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

const ShippingAddressScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const total = typeof params.total === 'string' ? params.total : '0';
  const { isLoggedIn, savedShippingAddress, saveShippingAddress } = useAuth();
  
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  const [saveAddress, setSaveAddress] = useState(false);
  
  // Load saved address if available
  useEffect(() => {
    if (isLoggedIn && savedShippingAddress) {
      setAddress(savedShippingAddress);
    }
  }, [isLoggedIn, savedShippingAddress]);

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields: (keyof ShippingAddress)[] = ['fullName', 'addressLine1', 'city', 'postalCode', 'country'];
    const missingFields = requiredFields.filter(field => !address[field]);
    
    if (missingFields.length > 0) {
      Alert.alert('Missing Information', `Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Save address if user is logged in and the save option is selected
    if (isLoggedIn && saveAddress) {
      await saveShippingAddress(address);
      Alert.alert('Success', 'Your shipping address has been saved for future orders.');
    }

    // Navigate to payment screen with total and shipping data
    router.push({
      pathname: '/(tabs)/payment',
      params: { 
        total,
        shippingAddress: JSON.stringify(address)
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Shipping Address</Text>
      <Text style={styles.subtitle}>Step 1 of 2</Text>
      
      {isLoggedIn && savedShippingAddress && (
        <View style={styles.savedAddressContainer}>
          <Text style={styles.savedAddressTitle}>Using your saved shipping address</Text>
        </View>
      )}
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={address.fullName}
          onChangeText={(text) => handleChange('fullName', text)}
          placeholder="John Doe"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address Line 1 *</Text>
        <TextInput
          style={styles.input}
          value={address.addressLine1}
          onChangeText={(text) => handleChange('addressLine1', text)}
          placeholder="123 Main Street"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address Line 2</Text>
        <TextInput
          style={styles.input}
          value={address.addressLine2}
          onChangeText={(text) => handleChange('addressLine2', text)}
          placeholder="Apt 4B (Optional)"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          value={address.city}
          onChangeText={(text) => handleChange('city', text)}
          placeholder="New York"
        />
      </View>
      
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>State/Province *</Text>
          <TextInput
            style={styles.input}
            value={address.state}
            onChangeText={(text) => handleChange('state', text)}
            placeholder="NY"
          />
        </View>
        
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>Postal Code *</Text>
          <TextInput
            style={styles.input}
            value={address.postalCode}
            onChangeText={(text) => handleChange('postalCode', text)}
            placeholder="10001"
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Country *</Text>
        <TextInput
          style={styles.input}
          value={address.country}
          onChangeText={(text) => handleChange('country', text)}
          placeholder="United States"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={address.phone}
          onChangeText={(text) => handleChange('phone', text)}
          placeholder="+1 (555) 123-4567"
          keyboardType="phone-pad"
        />
      </View>
      
      {isLoggedIn && (
        <View style={styles.saveAddressContainer}>
          <Text style={styles.saveAddressLabel}>Save this address for future orders?</Text>
          <Switch
            value={saveAddress}
            onValueChange={setSaveAddress}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={saveAddress ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      )}
      
      <TouchableOpacity style={styles.continueButton} onPress={handleSubmit}>
        <Text style={styles.continueButtonText}>Continue to Payment</Text>
      </TouchableOpacity>
      
      <Text style={styles.note}>* Required fields</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  savedAddressContainer: {
    backgroundColor: '#e6f7ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#b3e0ff',
  },
  savedAddressTitle: {
    fontSize: 16,
    color: '#0066cc',
    textAlign: 'center',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  saveAddressLabel: {
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  note: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
});

export default ShippingAddressScreen; 