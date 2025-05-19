import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Button, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCart } from '../../../src/state/CartContext';
import { useAuth } from '../../../src/state/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

const ProductDetailsScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isLoggedIn, addToWishlist, wishlist } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(
    wishlist.some(item => item.id === params.id)
  );

  const handleAddToCart = () => {
    addToCart({
      id: params.id as string,
      name: params.title as string,
      price: Number(params.price),
      quantity: 1,
      thumbnail: params.thumbnail as string,
    });
    Alert.alert('Success', 'Product added to cart!');
  };

  const handleAddToWishlist = () => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please log in to add items to your wishlist.', [
        { text: 'Go to Login', onPress: () => router.push('/(tabs)/auth') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    addToWishlist({
      id: params.id as string,
      name: params.title as string,
      price: Number(params.price),
      thumbnail: params.thumbnail as string,
    });
    setIsInWishlist(true);
    Alert.alert('Success', 'Product added to your wishlist!');
  };

  return (
    <View style={styles.container}>
      {params.thumbnail ? (
        <Image source={{ uri: params.thumbnail as string }} style={styles.image} />
      ) : null}
      <Text style={styles.title}>{params.title}</Text>
      <Text style={styles.price}>{params.price} {params.currency}</Text>
      <Text style={styles.description}>{params.description}</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Add to Cart" onPress={handleAddToCart} />
        
        {isLoggedIn && !isInWishlist && (
          <TouchableOpacity style={styles.wishlistButton} onPress={handleAddToWishlist}>
            <FontAwesome name="heart-o" size={24} color="#FF3B30" />
            <Text style={styles.wishlistButtonText}>Add to Wishlist</Text>
          </TouchableOpacity>
        )}
        
        {isLoggedIn && isInWishlist && (
          <View style={styles.inWishlistContainer}>
            <FontAwesome name="heart" size={24} color="#FF3B30" />
            <Text style={styles.inWishlistText}>In your wishlist</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  price: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  wishlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginTop: 10,
  },
  wishlistButtonText: {
    color: '#FF3B30',
    marginLeft: 8,
    fontWeight: '500',
  },
  inWishlistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
  },
  inWishlistText: {
    color: '#FF3B30',
    marginLeft: 8,
    fontWeight: '500',
  }
});

export default ProductDetailsScreen; 