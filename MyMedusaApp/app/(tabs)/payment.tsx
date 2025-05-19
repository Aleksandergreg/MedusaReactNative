import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Button, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { Camera } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/state/AuthContext';
import { useCart } from '../../src/state/CartContext';
import { FontAwesome } from '@expo/vector-icons';

const PaymentScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const totalAmount = typeof params.total === 'string' ? params.total : '0';
  const shippingAddressJson = typeof params.shippingAddress === 'string' ? params.shippingAddress : '{}';
  const shippingAddress = JSON.parse(shippingAddressJson);
  const { completeOrder } = useAuth();
  const { clearCart } = useCart();
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState(false);
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startScanning = () => {
    if (hasPermission) {
      setIsScanning(true);
      // Simulate a scan after 2 seconds
      setTimeout(() => {
        // Populate with demo data
        setCardNumber('4111 1111 1111 1111');
        setCardholderName('JOHN DOE');
        setExpiryDate('05/25');
        setIsScanning(false);
        
        Alert.alert('Card Scanned Successfully!', 'Card details have been filled automatically.');
      }, 2000);
    } else {
      Alert.alert(
        'Camera Permission Denied',
        'Please enable camera permissions to scan your card'
      );
    }
  };

  const handlePayment = () => {
    // Validate fields
    if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
      Alert.alert('Missing Information', 'Please fill in all card details');
      return;
    }
    
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      
      // Record the order and clear cart
      completeOrder();
      clearCart();
      
      // Navigate to success screen
      Alert.alert(
        'Payment Successful!', 
        'Your order has been placed successfully.',
        [{ text: 'OK', onPress: () => router.push('/(tabs)/profile') }]
      );
    }, 1500);
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Format as MM/YY
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  if (isScanning) {
    return (
      <View style={styles.cameraContainer}>
        <View style={styles.camera}>
          <View style={styles.cameraOverlay}>
            <Text style={styles.scanInstructions}>
              Scanning card...
            </Text>
            <View style={styles.cardFrame}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setIsScanning(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Payment Details</Text>
        <Text style={styles.subtitle}>Step 2 of 2</Text>
        <Text style={styles.totalText}>Total Amount: ${parseFloat(totalAmount).toFixed(2)}</Text>

        <View style={styles.shippingAddressSummary}>
          <Text style={styles.sectionTitle}>Shipping To:</Text>
          <Text style={styles.addressText}>{shippingAddress.fullName}</Text>
          <Text style={styles.addressText}>{shippingAddress.addressLine1}</Text>
          {shippingAddress.addressLine2 ? <Text style={styles.addressText}>{shippingAddress.addressLine2}</Text> : null}
          <Text style={styles.addressText}>{`${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`}</Text>
          <Text style={styles.addressText}>{shippingAddress.country}</Text>
          {shippingAddress.phone ? <Text style={styles.addressText}>Phone: {shippingAddress.phone}</Text> : null}
        </View>

        <View style={styles.cardForm}>
          <Text style={styles.sectionTitle}>Payment Method:</Text>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Card Number</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                keyboardType="number-pad"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                maxLength={19}
              />
              <TouchableOpacity 
                style={styles.scanButton} 
                onPress={startScanning}
              >
                <FontAwesome name="camera" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={cardholderName}
              onChangeText={setCardholderName}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldContainer, styles.halfField]}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                keyboardType="number-pad"
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                maxLength={5}
              />
            </View>

            <View style={[styles.fieldContainer, styles.halfField]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                keyboardType="number-pad"
                value={cvv}
                onChangeText={setCvv}
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>Pay Now</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    color: '#007AFF',
  },
  shippingAddressSummary: {
    marginBottom: 24,
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  addressText: {
    fontSize: 15,
    marginBottom: 4,
    color: '#333',
    lineHeight: 20,
  },
  cardForm: {
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButton: {
    padding: 12,
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    flex: 0.48,
  },
  payButton: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFrame: {
    width: 300,
    height: 190,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanInstructions: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    position: 'absolute',
    bottom: 40,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen; 