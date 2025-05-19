import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
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
      <View style={styles.container}>
        <Text style={styles.title}>Not logged in</Text>
        <Button title="Go to Login" onPress={() => router.push('/(tabs)/auth')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Page</Text>
      <Text style={styles.subtitle}>Email: {user?.email}</Text>
      <Button title="Logout" onPress={logout} />
      <Text style={styles.ordersTitle}>Latest Orders:</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : orders.length === 0 ? (
        <Text style={styles.noOrders}>No orders yet.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },
  ordersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  noOrders: {
    color: '#888',
    marginTop: 16,
  },
  orderBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: '100%',
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