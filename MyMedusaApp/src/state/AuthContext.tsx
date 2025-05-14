import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Order {
  id: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  biometricsEnabled: boolean;
  setBiometricsEnabled: (enabled: boolean) => void;
  getOrders: () => Promise<Order[]>;
  addOrder: (order: Order) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [biometricsEnabled, setBiometricsEnabledState] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('biometricsEnabled').then(val => {
      setBiometricsEnabledState(val === 'true');
    });
  }, []);

  const setBiometricsEnabled = (enabled: boolean) => {
    setBiometricsEnabledState(enabled);
    AsyncStorage.setItem('biometricsEnabled', enabled ? 'true' : 'false');
  };

  const login = async (email: string, password: string) => {
    // Simulate login (replace with real API call)
    if (email && password) {
      setUser({ email });
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string) => {
    // Simulate signup (replace with real API call)
    if (email && password) {
      setUser({ email });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const getOrders = async (): Promise<Order[]> => {
    if (!user) return [];
    const key = `orders_${user.email}`;
    const ordersStr = await AsyncStorage.getItem(key);
    return ordersStr ? JSON.parse(ordersStr) : [];
  };

  const addOrder = async (order: Order) => {
    if (!user) return;
    const key = `orders_${user.email}`;
    const orders = await getOrders();
    orders.unshift(order);
    await AsyncStorage.setItem(key, JSON.stringify(orders));
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout, biometricsEnabled, setBiometricsEnabled, getOrders, addOrder }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}; 