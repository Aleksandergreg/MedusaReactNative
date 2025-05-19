import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, SafeAreaView, Alert, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/state/AuthContext';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

export default function ProfileScreen() {
  const { user, isLoggedIn, getOrders, logout, orderRefreshFlag, wishlist, removeFromWishlist, reorderWishlist } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist'>('orders');
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      getOrders().then(setOrders).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, orderRefreshFlag]);

  const handleViewProduct = (item: any) => {
    router.push({
      pathname: '/(tabs)/products/product-details',
      params: {
        id: item.id,
        title: item.name,
        price: item.price.toString(),
        thumbnail: item.thumbnail || '',
      }
    });
  };

  const handleRemoveFromWishlist = (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromWishlist(id) }
      ]
    );
  };

  const renderWishlistItem = ({ item, drag, isActive }: RenderItemParams<any>) => {
    return (
      <TouchableOpacity
        onLongPress={drag}
        style={[
          styles.wishlistItemContainer,
          isActive && { elevation: 5, shadowOpacity: 0.3, backgroundColor: '#f0f0f0' }
        ]}
        disabled={isActive}
      >
        <Image
          source={{ uri: item.thumbnail || 'https://via.placeholder.com/60' }}
          style={styles.wishlistItemImage}
          resizeMode="cover"
        />
        <View style={styles.wishlistItemContent}>
          <Text style={styles.wishlistItemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.wishlistItemPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.wishlistItemActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleViewProduct(item)}
          >
            <FontAwesome name="eye" size={18} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.removeButton]} 
            onPress={() => handleRemoveFromWishlist(item.id)}
          >
            <FontAwesome name="trash" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        <View style={styles.dragHandle}>
          <FontAwesome name="bars" size={16} color="#999" />
        </View>
      </TouchableOpacity>
    );
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <Text style={styles.title}>Not logged in</Text>
          <Button title="Go to Login" onPress={() => router.push('/(tabs)/auth')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Page</Text>
        <Text style={styles.subtitle}>Email: {user?.email}</Text>
        <Button title="Logout" onPress={logout} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'orders' && styles.activeTab]} 
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'wishlist' && styles.activeTab]} 
          onPress={() => setActiveTab('wishlist')}
        >
          <Text style={[styles.tabText, activeTab === 'wishlist' && styles.activeTabText]}>
            Wishlist
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'orders' ? (
        <View style={styles.ordersContainer}>
          <Text style={styles.ordersTitle}>Latest Orders:</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : orders.length === 0 ? (
            <Text style={styles.noOrders}>No orders yet.</Text>
          ) : (
            <FlatList
              data={orders}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.orderBox}>
                  <Text style={styles.orderDate}>{item.date}</Text>
                  {item.items.map((prod: any, idx: number) => (
                    <Text key={idx} style={styles.orderItem}>{prod.name} x {prod.quantity} - ${prod.price.toFixed(2)}</Text>
                  ))}
                  <Text style={styles.orderTotal}>Total: ${item.total.toFixed(2)}</Text>
                </View>
              )}
            />
          )}
        </View>
      ) : (
        <View style={styles.wishlistContainer}>
          <Text style={styles.wishlistTitle}>
            Your Wishlist:
            <Text style={styles.dragHint}> (Long press and drag to reorder)</Text>
          </Text>
          {wishlist.length === 0 ? (
            <View style={styles.emptyWishlist}>
              <Text style={styles.emptyWishlistText}>Your wishlist is empty</Text>
              <Button 
                title="Browse Products" 
                onPress={() => router.push('/(tabs)/products')} 
              />
            </View>
          ) : (
            <DraggableFlatList
              data={wishlist}
              keyExtractor={item => item.id}
              renderItem={renderWishlistItem}
              onDragEnd={({ data }) => reorderWishlist(data)}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

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
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
  ordersContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  wishlistContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ordersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
  },
  wishlistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
  },
  dragHint: {
    fontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  noOrders: {
    color: '#888',
    marginTop: 16,
  },
  loadingText: {
    color: '#888',
    marginTop: 16,
  },
  orderBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderDate: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  orderItem: {
    fontSize: 15,
    color: '#333',
  },
  orderTotal: {
    fontWeight: 'bold',
    marginTop: 6,
    color: '#222',
  },
  wishlistItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  wishlistItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  wishlistItemContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  wishlistItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  wishlistItemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  wishlistItemActions: {
    flexDirection: 'row',
    marginRight: 8,
  },
  actionButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 4,
  },
  dragHandle: {
    padding: 8,
  },
  emptyWishlist: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyWishlistText: {
    color: '#888',
    marginBottom: 16,
    fontSize: 16,
  },
}); 