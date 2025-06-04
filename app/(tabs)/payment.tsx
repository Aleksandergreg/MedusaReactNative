import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/state/AuthContext';
import { useCart } from '../../src/state/CartContext';
import ScreenContainer from '@/components/ScreenContainer';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

// This URL should point to your Medusa backend
const BACKEND_URL = "http://10.136.136.194:9000"; // Use your computer's actual IP address

const PaymentScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const totalAmount = typeof params.total === 'string' ? params.total : '0';
  const shippingAddressJson = typeof params.shippingAddress === 'string' ? params.shippingAddress : '{}';
  const shippingAddress = JSON.parse(shippingAddressJson);
  const { completeOrder } = useAuth();
  const { clearCart } = useCart();
  
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [publishableKey, setPublishableKey] = useState('');

  // Fetch payment sheet params from your Medusa backend
  const fetchPaymentSheetParams = async () => {
    setLoading(true);
    try {
      console.log("Fetching payment intent from:", `${BACKEND_URL}/payment-intent`);
      
      const response = await fetch(`${BACKEND_URL}/payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(totalAmount).toFixed(2), // Ensure proper decimal format
          currency: 'usd', // Change this if needed
          // Optionally include customer_id if the user is logged in
          // customer_id: user.id
        }),
      });
      
      const data = await response.json();
      console.log("Payment intent response:", JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        throw new Error(data.message || 'Error fetching payment details');
      }
      
      if (!data.paymentIntent || !data.paymentIntent.startsWith('pi_')) {
        console.error("Invalid payment intent received:", data.paymentIntent);
        throw new Error('Invalid payment intent received from server');
      }
      
      // Use a hardcoded publishable key if the backend doesn't provide one
      const stripeKey = data.publishableKey || 'pk_test_51RQY8ARkqrA6nukbH9eJ6bQA5bC6oQ2zqzRdouqSSELk6o1uPrxHig2ZpMdbsCtvCjJYT5TLii2NsGhiYV23V6Ej00trL6piGu';
      console.log("Using publishable key:", stripeKey);
      setPublishableKey(stripeKey);
      
      return {
        paymentIntent: data.paymentIntent,
        ephemeralKey: data.ephemeralKey,
        customer: data.customer,
      };
    } catch (error) {
      console.log('Error fetching payment params:', error);
      Alert.alert('Error', 'Unable to initialize payment. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const initializePaymentSheet = async () => {
    try {
      const {
        paymentIntent,
        ephemeralKey,
        customer,
      } = await fetchPaymentSheetParams();
      
      console.log("Payment sheet params:", {
        paymentIntent: typeof paymentIntent, 
        ephemeralKeyProvided: !!ephemeralKey, 
        customerProvided: !!customer
      });
      
      if (!paymentIntent || typeof paymentIntent !== 'string') {
        throw new Error('Invalid payment intent received from server');
      }

      console.log("Initializing payment sheet...");
      const { error } = await initPaymentSheet({
        merchantDisplayName: "MyMedusaApp Store",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        // Enable delayed payment methods like SEPA Debit and Sofort only if your business can handle payment
        // methods that complete payment after a delay
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: shippingAddress.fullName,
          address: {
            city: shippingAddress.city,
            country: shippingAddress.country,
            line1: shippingAddress.addressLine1,
            line2: shippingAddress.addressLine2,
            postalCode: shippingAddress.postalCode,
            state: shippingAddress.state,
          }
        }
      });

      if (error) {
        console.log('Error initializing payment sheet:', error.message);
        Alert.alert('Error', 'Unable to initialize the payment process. Please try again.');
      } else {
        console.log('Payment sheet initialized successfully');
        setLoading(true);
      }
    } catch (error) {
      console.log('Error initializing payment:', error.message);
      Alert.alert('Error', error.message || 'Unable to initialize payment');
    }
  };

  const handlePayment = async () => {
    if (!loading) {
      // If not initialized yet, do that first
      console.log("Payment sheet not initialized yet, initializing...");
      await initializePaymentSheet();
      return;
    }
    
    console.log("Presenting payment sheet...");
    setProcessing(true);
    
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        console.log(`Payment sheet error: ${error.code}`, error.message);
        Alert.alert(`Payment Failed`, error.message);
      } else {
        console.log("Payment successful!");
        // Payment was successful
        completeOrder();
        clearCart();
        
        Alert.alert(
          'Payment Successful!', 
          'Your order has been placed successfully.',
          [{ text: 'OK', onPress: () => router.push('/(tabs)/profile') }]
        );
      }
    } catch (error) {
      console.log('Error presenting payment sheet:', error.message);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    // Initialize payment sheet when the component mounts
    initializePaymentSheet();
  }, []);

  return (
    <StripeProvider
      publishableKey={publishableKey || 'pk_test_placeholder'}
      merchantIdentifier="merchant.com.mymedusaapp" // Replace with your merchant ID
      urlScheme="mymedusaapp" // Replace with your app's URL scheme
    >
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
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                You&apos;ll be redirected to a secure payment screen to complete your purchase.
              </Text>
              <Text style={styles.noteText}>
                • On iOS, you can scan your card with the camera
              </Text>
              <Text style={styles.noteText}>
                • Your payment information is processed securely by Stripe
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.payButtonText}>Continue to Payment</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenContainer>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  shippingAddressSummary: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 16,
    marginBottom: 5,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
  },
  noteText: {
    fontSize: 14,
    marginTop: 5,
  },
  payButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
}); 

export default PaymentScreen;