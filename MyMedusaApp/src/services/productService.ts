// src/services/productService.ts
import medusaClient from '../api/medusaClient';

// Custom type definitions to replace dependencies on @medusajs/medusa
export interface Product {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  handle: string | null; 
  variants: ProductVariant[];
  [key: string]: any; // For any additional fields
}

export interface ProductVariant {
  id: string;
  title: string;
  prices: ProductPrice[];
  [key: string]: any; // For any additional fields
}

export interface ProductPrice {
  id: string;
  amount: number;
  currency_code: string;
  [key: string]: any; // For any additional fields
}

export interface StoreProductsListParams {
  limit?: number;
  offset?: number;
  q?: string;
  [key: string]: any; // For any additional filtering options
}

export interface StoreProductsListRes {
  products: Product[];
  count: number;
  offset: number;
  limit: number;
}

export const fetchProducts = async (params?: StoreProductsListParams): Promise<StoreProductsListRes> => {
  try {
    const response = await medusaClient.get('/products', { params });
    // Axios wraps the response data in a `data` property
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    // Re-throw or handle error as needed
    throw error;
  }
};