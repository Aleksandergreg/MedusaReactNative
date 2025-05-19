import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, SafeAreaView } from 'react-native';
import { useAuth } from '../../src/state/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, isLoggedIn, getOrders, logout, orderRefreshFlag } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      getOrders().then(setOrders).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, orderRefreshFlag]);

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
  ordersContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ordersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
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
}); 