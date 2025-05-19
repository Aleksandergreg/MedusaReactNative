import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  ImageBackground
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/state/AuthContext';
import { useCart } from '../../src/state/CartContext';
import { FontAwesome } from '@expo/vector-icons';
import ScreenContainer from '@/components/ScreenContainer';

// Regular expressions for card recognition (for demonstration purposes)
const CARD_NUMBER_REGEX = /\b(?:\d[ -]*?){13,19}\b/g;
const EXPIRY_DATE_REGEX = /\b(0[1-9]|1[0-2])[\/\s.-]?([0-9]{2})\b/g;
const NAME_REGEX = /\b[A-Z][A-Z\s]{2,26}\b/g;

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
  const [processing, setProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [scanningProgress, setScanningProgress] = useState(0);
  
  // Camera simulation states
  const [captureComplete, setCaptureComplete] = useState(false);
  const [analyzeComplete, setAnalyzeComplete] = useState(false);
  
  // Start the card scanning simulation
  const startScanning = () => {
    setIsScanning(true);
    setScanStatus('Position your card in the frame');
    setScanningProgress(0);
    setCaptureComplete(false);
    setAnalyzeComplete(false);
  };
  
  // Simulate capturing an image of a credit card
  const simulateCapture = () => {
    setScanStatus('Capturing image...');
    
    // Simulate a loading time for capturing the image
    setTimeout(() => {
      setCaptureComplete(true);
      setScanStatus('Processing card...');
      
      // Simulate analyzing the card after capturing
      setTimeout(() => {
        setScanStatus('Extracting card details...');
        
        // Simulate finding each piece of information with delays
        setTimeout(() => {
          setCardNumber('4242 4242 4242 4242');
          setScanStatus('Found card number');
          
          setTimeout(() => {
            setCardholderName('JOHN DOE');
            setScanStatus('Found cardholder name');
            
            setTimeout(() => {
              setExpiryDate('12/25');
              setScanStatus('Found expiry date');
              setAnalyzeComplete(true);
              
              // Finish the scanning process
              setTimeout(() => {
                setIsScanning(false);
                Alert.alert('Card Scanned', 'Card details have been extracted successfully');
              }, 1000);
            }, 700);
          }, 800);
        }, 1000);
      }, 1200);
    }, 1000);
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
  
  // Render camera scanning simulation screen
  if (isScanning) {
    if (captureComplete) {
      // Show the analysis screen after capture
      return (
        <View style={styles.fullScreen}>
          <View style={styles.analyzeContainer}>
            <View style={styles.statusBar}>
              <Text style={styles.statusText}>{scanStatus}</Text>
            </View>
            
            {!analyzeComplete && <ActivityIndicator size="large" color="#FFFFFF" style={styles.loadingIndicator} />}
            
            {analyzeComplete ? (
              <View style={styles.resultContainer}>
                <Text style={styles.resultText}>Card Number: {cardNumber}</Text>
                <Text style={styles.resultText}>Name: {cardholderName}</Text>
                <Text style={styles.resultText}>Expires: {expiryDate}</Text>
              </View>
            ) : null}
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setIsScanning(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    // Show the camera simulation screen
    return (
      <View style={styles.fullScreen}>
        <View style={styles.cameraSim}>
          <View style={styles.statusBar}>
            <Text style={styles.statusText}>{scanStatus}</Text>
          </View>
          
          <View style={styles.cardFrame}>
            <Text style={styles.frameText}>Position card here</Text>
          </View>
          
          <View style={styles.cameraControls}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setIsScanning(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={simulateCapture}
            >
              <View style={styles.captureCircle} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Regular payment screen
  return (
    <ScreenContainer>
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
    </ScreenContainer>
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
    marginBottom: 20,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  // Camera simulation styles
  fullScreen: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraSim: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'space-between',
    padding: 20,
  },
  analyzeContainer: {
    flex: 1, 
    backgroundColor: '#222',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  statusBar: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
    marginTop: 40,
    alignSelf: 'center',
  },
  statusText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  cardFrame: {
    alignSelf: 'center',
    width: 300,
    height: 190,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingIndicator: {
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  resultText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  }
});

export default PaymentScreen; 