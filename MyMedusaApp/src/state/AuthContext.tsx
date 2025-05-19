import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Order {
  id: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  thumbnail?: string;
  addedAt: number; // timestamp for ordering
}

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
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
  completeOrder: () => Promise<void>;
  orderRefreshFlag: number;
  
  // Wishlist functions
  wishlist: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'addedAt'>) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  reorderWishlist: (wishlist: WishlistItem[]) => Promise<void>;
  
  // Shipping address functions
  savedShippingAddress: ShippingAddress | null;
  saveShippingAddress: (address: ShippingAddress) => Promise<void>;
  clearSavedShippingAddress: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [biometricsEnabled, setBiometricsEnabledState] = useState(false);
  const [orderRefreshFlag, setOrderRefreshFlag] = useState(0);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [savedShippingAddress, setSavedShippingAddress] = useState<ShippingAddress | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('biometricsEnabled').then(val => {
      setBiometricsEnabledState(val === 'true');
    });
  }, []);
  
  // Load wishlist and shipping address when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        // Load wishlist
        try {
          const wishlistStr = await AsyncStorage.getItem(`wishlist_${user.email}`);
          if (wishlistStr) {
            setWishlist(JSON.parse(wishlistStr));
          }
        } catch (error) {
          console.error('Error loading wishlist:', error);
        }
        
        // Load saved shipping address
        try {
          const addressStr = await AsyncStorage.getItem(`shippingAddress_${user.email}`);
          if (addressStr) {
            setSavedShippingAddress(JSON.parse(addressStr));
          }
        } catch (error) {
          console.error('Error loading shipping address:', error);
        }
      } else {
        // Clear data when user logs out
        setWishlist([]);
        setSavedShippingAddress(null);
      }
    };
    
    loadUserData();
  }, [user]);

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
    // Increment the refresh flag to trigger updates
    setOrderRefreshFlag(prev => prev + 1);
  };

  const completeOrder = async () => {
    if (!user) return;
    
    const cart = await AsyncStorage.getItem('cart');
    if (!cart) return;
    
    const cartItems = JSON.parse(cart);
    const total = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    
    const order = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      items: cartItems,
      total,
    };
    
    await addOrder(order);
  };
  
  // Wishlist functions
  const addToWishlist = async (item: Omit<WishlistItem, 'addedAt'>) => {
    if (!user) return;
    
    // Check if item already exists
    const exists = wishlist.some(wishItem => wishItem.id === item.id);
    if (exists) return;
    
    // Add item to wishlist with timestamp
    const newItem: WishlistItem = { ...item, addedAt: Date.now() };
    const newWishlist = [...wishlist, newItem];
    setWishlist(newWishlist);
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(`wishlist_${user.email}`, JSON.stringify(newWishlist));
  };
  
  const removeFromWishlist = async (id: string) => {
    if (!user) return;
    
    const newWishlist = wishlist.filter(item => item.id !== id);
    setWishlist(newWishlist);
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(`wishlist_${user.email}`, JSON.stringify(newWishlist));
  };
  
  const reorderWishlist = async (newWishlist: WishlistItem[]) => {
    if (!user) return;
    
    setWishlist(newWishlist);
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(`wishlist_${user.email}`, JSON.stringify(newWishlist));
  };
  
  // Shipping address functions
  const saveShippingAddress = async (address: ShippingAddress) => {
    if (!user) return;
    
    setSavedShippingAddress(address);
    await AsyncStorage.setItem(`shippingAddress_${user.email}`, JSON.stringify(address));
  };
  
  const clearSavedShippingAddress = async () => {
    if (!user) return;
    
    setSavedShippingAddress(null);
    await AsyncStorage.removeItem(`shippingAddress_${user.email}`);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, 
      login, 
      signup, 
      logout, 
      biometricsEnabled, 
      setBiometricsEnabled, 
      getOrders, 
      addOrder,
      completeOrder,
      orderRefreshFlag,
      wishlist,
      addToWishlist,
      removeFromWishlist,
      reorderWishlist,
      savedShippingAddress,
      saveShippingAddress,
      clearSavedShippingAddress
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}; 