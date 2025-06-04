// src/api/medusaClient.ts
import axios from 'axios';

// Determine the base URL based on the platform and environment
// For local development testing against a backend on the same machine:
// - iOS Simulator: Use http://localhost:9000
// - Android Emulator: Use http://10.0.2.2:9000 (Android Emulator's alias for host machine's localhost)
// - Physical Device: Use your machine's local network IP address http://10.15.27.231:9000 (e.g., http://192.168.1.10:9000)
// In a real app, this might be dynamically determined or set via environment variables.
const MEDUSA_BACKEND_URL = 'http://10.136.136.177:9000'; // Adjust if needed for Android Emulator/Physical Device

const medusaClient = axios.create({
  baseURL: `${MEDUSA_BACKEND_URL}/store`, // Default to /store endpoints
  timeout: 10000, // Optional: Set a request timeout (e.g., 10 seconds)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-publishable-api-key': 'pk_be4a4a642c37fd79ef65388a73eb77a79e71fbda4c1c9ce4158145cb65c018c3'
  },
});

// Optional: Add interceptors for logging, error handling, or token management
medusaClient.interceptors.request.use(
  (config) => {
    // console.log('Starting Request', config.method?.toUpperCase(), config.url);
    // Add auth tokens here if needed
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

medusaClient.interceptors.response.use(
  (response) => {
    // console.log('Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response?.status, error.response?.data);
    // Handle global errors (e.g., 401 Unauthorized)
    return Promise.reject(error);
  }
);

export default medusaClient;