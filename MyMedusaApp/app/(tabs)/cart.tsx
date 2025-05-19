import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, TouchableOpacity, Alert, Image, SafeAreaView } from 'react-native';
import { useCart } from '../../src/state/CartContext';
import { useAuth } from '../../src/state/AuthContext';
import { useRouter } from 'expo-router';

const CartScreen = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please log in to proceed to checkout.', [
        { text: 'Go to Login', onPress: () => router.push('/(tabs)/auth') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    
    // Navigate to shipping address first
    router.push({
      pathname: '/(tabs)/shipping-address',
      params: { total: total.toFixed(2) }
    });
  };

  const renderItem = ({ item }: { item: { id: string; name: string; price: number; quantity: number; thumbnail?: string } }) => (
    <View style={styles.item}>
      {item.thumbnail && (
        <Image 
          source={{ uri: item.thumbnail }} 
          style={styles.thumbnail} 
          resizeMode="cover"
        />
      )}
      <View style={styles.itemContent}>
        <View style={styles.itemRow}>
          <Text style={styles.itemName}>{item.name}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemDetails}>${item.price.toFixed(2)} x {item.quantity}</Text>
          <Text style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
        </View>
        <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart</Text>
      </View>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.footer}>
        <View style={styles.summary}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Clear Cart" onPress={clearCart} disabled={cartItems.length === 0} />
          <View style={styles.buttonSpacer} />
          <Button title={checkingOut ? 'Processing...' : 'Proceed to Checkout'} onPress={handleCheckout} disabled={cartItems.length === 0 || checkingOut} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  itemContent: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  itemDetails: {
    fontSize: 14,
    color: '#888',
    marginRight: 8,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    alignSelf: 'flex-start',
    padding: 6,
    backgroundColor: '#ff3b30',
    borderRadius: 4,
    marginTop: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  footer: {
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonSpacer: {
    width: 10,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 32,
  },
});

export default CartScreen; 