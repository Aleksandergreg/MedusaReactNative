// src/screens/ProductListScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  Button, 
  Image, 
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { fetchProducts, Product } from '../services/productService';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.9;

const ProductListScreen = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async (refresh = false) => {
    if (!refresh) setIsLoading(true);
    setError(null);
    try {
      const response = await fetchProducts({ limit: 20 });
      setProducts(response.products);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts(true);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const renderProduct = ({ item }: { item: Product }) => {
    const hasPrice = Array.isArray(item.variants) && item.variants.length > 0 &&
      Array.isArray(item.variants[0].prices) && item.variants[0].prices.length > 0;
    
    const price = hasPrice ? (item.variants[0].prices[0].amount / 100) : null;
    const currency = hasPrice ? item.variants[0].prices[0].currency_code?.toUpperCase() : '';
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.8}
        onPress={() => router.push({
          pathname: '/(tabs)/products/product-details',
          params: {
            id: item.id,
            title: item.title,
            description: item.description,
            price: price ? price.toString() : '',
            currency: currency,
            thumbnail: item.thumbnail || '',
          }
        })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.thumbnail || 'https://via.placeholder.com/300' }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description || 'No description available.'}
          </Text>
          {hasPrice && (
            <Text style={styles.price}>
              {price} {currency}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={() => loadProducts()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  productCard: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 4,
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default ProductListScreen;