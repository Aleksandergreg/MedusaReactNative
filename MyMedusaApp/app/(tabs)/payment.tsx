import React, { useState, useEffect } from 'react';
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
  // ImageBackground, // Removed as it was not used
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/state/AuthContext';
import { useCart } from '../../src/state/CartContext';
import { FontAwesome } from '@expo/vector-icons';
import ScreenContainer from '@/components/ScreenContainer';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Import CameraView and useCameraPermissions

// Regular expressions for card recognition (for demonstration purposes)
const CARD_NUMBER_REGEX = /\b(?:\d[ -]*?){13,19}\b/g;
const EXPIRY_DATE_REGEX = /\b(0[1-9]|1[0-2])[\/\s.-]?([0-9]{2})\b/g;
const NAME_REGEX = /\b[A-Z][A-Z\s]{2,26}\b/g;

const PaymentScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const totalAmount = typeof params.total === 'string' ? params.total : '0';
  const shippingAddressJson = typeof params.shippingAddress === 'string' ? params.shippingAddress : '{}';
  const shippingAddress = JSON.parse(shippingAddressJson); // Consider adding try-catch for robustness
  const { completeOrder } = useAuth();
  const { clearCart } = useCart();

  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  // const [scanningProgress, setScanningProgress] = useState(0); // Keep if you plan to use it, otherwise can be removed

  // Camera and simulation states
  const [permission, requestPermission] = useCameraPermissions();
  const [captureComplete, setCaptureComplete] = useState(false);
  const [analyzeComplete, setAnalyzeComplete] = useState(false);

  // Start the card scanning process (request permission and show camera)
  const startCardScan = async () => {
    if (!permission) {
      // Permissions are still loading, wait for them.
      // This case should ideally be handled by useEffect or initial permission check.
      const perm = await requestPermission();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to scan your card.');
        return;
      }
    } else if (!permission.granted) {
      const perm = await requestPermission(); // Re-request if not granted initially
      if (!perm.granted) {
        Alert.alert('Permission Denied', 'Please enable camera permissions in settings to use this feature.');
        return;
      }
    }

    setIsScanning(true);
    setScanStatus('Position your card in the frame');
    // setScanningProgress(0);
    setCaptureComplete(false);
    setAnalyzeComplete(false);
  };

  // Simulate capturing an image and extracting data (hardcoded)
  const simulateCaptureAndExtraction = () => {
    // This function is called when the user presses the capture button on the camera screen.
    // The actual image from CameraView is not processed in this simulation.
    setScanStatus('Capturing image...'); // Initial status

    // Simulate a loading time for "capturing"
    setTimeout(() => {
      setCaptureComplete(true); // Move to the "analyzing" screen
      setScanStatus('Processing card...');

      // Simulate analyzing the card after "capturing"
      setTimeout(() => {
        setScanStatus('Extracting card details...');

        // Simulate finding each piece of information with delays
        setTimeout(() => {
          setCardNumber('4242 4242 4242 4242'); // Hardcoded data
          setScanStatus('Found card number');

          setTimeout(() => {
            setCardholderName('JOHN DOE'); // Hardcoded data
            setScanStatus('Found cardholder name');

            setTimeout(() => {
              setExpiryDate('12/25'); // Hardcoded data
              setScanStatus('Found expiry date');
              setAnalyzeComplete(true);

              // Finish the scanning process
              setTimeout(() => {
                setIsScanning(false); // Close camera/analysis view
                Alert.alert('Card Scanned', 'Card details have been extracted successfully');
              }, 1000);
            }, 700);
          }, 800);
        }, 1000);
      }, 1200);
    }, 500); // Shortened initial "capture" delay as user already pressed a button
  };

  const handlePayment = () => {
    if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
      Alert.alert('Missing Information', 'Please fill in all card details');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      completeOrder();
      clearCart();
      Alert.alert(
        'Payment Successful!',
        'Your order has been placed successfully.',
        [{ text: 'OK', onPress: () => router.push('/(tabs)/profile') }]
      );
    }, 1500);
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // Render logic for different scanning states
  if (isScanning) {
    if (!permission) {
      // Permissions are still loading (should be quick)
      return <View style={styles.fullScreen}><ActivityIndicator size="large" color="#FFFFFF" style={styles.centeredIndicator} /></View>;
    }

    if (!permission.granted) {
      // Permissions are not granted
      return (
        <View style={styles.fullScreenCentered}>
          <Text style={styles.permissionText}>Camera permission is required to scan your card.</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelButton, {marginTop: 10}]} // Added margin for spacing
            onPress={() => setIsScanning(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // If capture is "complete" (simulation step), show the analysis screen
    if (captureComplete) {
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
              onPress={() => setIsScanning(false)} // Allow canceling analysis
            >
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Show the REAL camera view with overlays
    return (
      <View style={styles.fullScreen}>
        <CameraView style={StyleSheet.absoluteFillObject} facing="back" testID="camera-view">
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraTopBar}>
                <Text style={styles.statusText}>{scanStatus}</Text>
            </View>

            <View style={styles.cardFrame}>
              <Text style={styles.frameText}>Position card in frame</Text>
            </View>

            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.cameraCancelButton}
                onPress={() => setIsScanning(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={simulateCaptureAndExtraction}
              >
                <View style={styles.captureInnerButton} />
              </TouchableOpacity>
              {/* Placeholder for symmetry if needed, or adjust justifyContent */}
              <View style={{ width: styles.cameraCancelButton.width || 70 }} />
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // Regular payment form screen
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
                  onPress={startCardScan} // Changed to startCardScan
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
  // Full screen and camera related styles
  fullScreen: {
    flex: 1,
    backgroundColor: 'black', // Camera background is black
  },
  fullScreenCentered: { // For permission messages
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centeredIndicator: {
    alignSelf: 'center', // Center activity indicator in fullScreen
    justifyContent: 'center',
    flex: 1,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 10,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between', // Pushes top bar to top, controls to bottom
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 50 : 30, // Adjust padding for status bar/notches
  },
  cameraTopBar: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    // marginTop: Platform.OS === 'ios' ? 40 : 20, // Moved padding to cameraOverlay
  },
  statusText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  cardFrame: { // This view is in the "middle" part of the overlay
    alignSelf: 'center',
    width: '95%', // Responsive width
    aspectRatio: 1.586, // Credit card aspect ratio (85.60mm × 53.98mm)
    maxWidth: 380, // Max width for larger screens
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 5,
    borderRadius: 5,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distributes cancel, capture, and placeholder
    alignItems: 'center',
    // marginBottom: Platform.OS === 'ios' ? 20 : 30, // Moved padding to cameraOverlay
  },
  captureButton: { // The large circular capture button
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.4)', // Semi-transparent white
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInnerButton: { // The inner solid circle
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
  },
  cameraCancelButton: { // Specific style for cancel button on camera screen if needed
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', // Darker, less prominent than main cancel
    borderRadius: 8,
    width: 90, // Give it a defined width for balance
    alignItems: 'center',
  },
  cancelButton: { // General cancel/done button style
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
    // Removed fixed marginBottom, apply as needed
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles for the analysis screen (after "captureComplete")
  analyzeContainer: {
    flex: 1,
    backgroundColor: '#222', // Same dark background
    justifyContent: 'space-around', // Distribute elements better
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  loadingIndicator: {
    // No specific style needed if it's just the component, or add margin if necessary
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
  },
});

export default PaymentScreen;