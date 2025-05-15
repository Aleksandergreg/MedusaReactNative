import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, TouchableOpacity, Alert, Image } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
        style={styles.list}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: '#444',
    marginBottom: 24,
    textAlign: 'center',
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
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