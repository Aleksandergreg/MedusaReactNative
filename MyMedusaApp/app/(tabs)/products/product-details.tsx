import React from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCart } from '../../../src/state/CartContext';

const ProductDetailsScreen = () => {
  const params = useLocalSearchParams();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: params.id as string,
      name: params.title as string,
      price: Number(params.price),
      quantity: 1,
      thumbnail: params.thumbnail as string,
    });
  };

  return (
    <View style={styles.container}>
      {params.thumbnail ? (
        <Image source={{ uri: params.thumbnail as string }} style={styles.image} />
      ) : null}
      <Text style={styles.title}>{params.title}</Text>
      <Text style={styles.price}>{params.price} {params.currency}</Text>
      <Text style={styles.description}>{params.description}</Text>
      <Button title="Add to Cart" onPress={handleAddToCart} />
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
});

export default ProductDetailsScreen; 