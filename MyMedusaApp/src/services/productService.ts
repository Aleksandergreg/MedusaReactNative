// src/services/productService.ts
import medusaClient from '../api/medusaClient';
import { StoreProductsListRes, StoreProductsListParams } from '@medusajs/medusa'; // Import types if available

export const fetchProducts = async (params?: StoreProductsListParams): Promise<StoreProductsListRes> => {
  try {
    // The base URL already includes /store
    const response = await medusaClient.get('/products', { params });
    // Axios wraps the response data in a `data` property
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    // Re-throw or handle error as needed
    throw error;
  }
};