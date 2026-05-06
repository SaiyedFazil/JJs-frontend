import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Config from 'react-native-config';
import { getAccessToken, clearAuthData } from '@/utils/storage';

/**
 * Professional Axios Instance Configuration
 * Includes:
 * 1. Base URL from environment variables
 * 2. Standardized timeout
 * 3. Request Interceptors for Auth Headers
 * 4. Response Interceptors for Global Error Handling
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_URL, // Fallback for safety
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Auth Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    // Only attach stored token if Authorization header is not already manually set
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {


    // Handle 401 Unauthorized (Token Expired)
    if (error.response?.status === 401) {
      // Logic for token refresh would go here
      // For now, we clear auth data and let the app handle redirection
      console.warn('Unauthorized access, clearing session...');
      clearAuthData();
      
      // Optional: Trigger a global event or update store to redirect to login
      // useAuthStore.getState().logout(); 
    }

    // Standardized Error Response
    const errorMessage = 
      (error.response?.data as any)?.message || 
      error.message || 
      'Something went wrong';

    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

export default apiClient;
