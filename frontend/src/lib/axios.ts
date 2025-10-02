import axios from "axios";

// Use VITE_API_BASE_URL if set, otherwise default based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' ? "/api" : "http://localhost:5137/api");

console.log('🔧 Axios Config:', {
  MODE: import.meta.env.MODE,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_BASE_URL: API_BASE_URL
});

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
    (config: any) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error: any) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Add request interceptor to ensure token is fresh
axiosInstance.interceptors.request.use(
    async (config: any) => {
        // Try to get a fresh token before each request
        try {
            const { getToken } = await import('@clerk/clerk-react');
            const token = await getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('🔑 Fresh token attached to request');
            }
        } catch (error) {
            console.log('⚠️ Could not refresh token for request');
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response: any) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    async (error: any) => {
        console.error('❌ API Error:', error.message);
        
        // If it's a 401 error, try to refresh the token
        if (error.response?.status === 401) {
            console.log('🔄 401 Error - Attempting to refresh token...');
            
            try {
                // Import Clerk's useAuth hook dynamically
                const { useAuth } = await import('@clerk/clerk-react');
                // This won't work in an interceptor, so we'll handle it in components
                console.log('⚠️ Token refresh needed - handled by component retry logic');
            } catch (refreshError) {
                console.error('❌ Token refresh failed:', refreshError);
            }
        }
        
        if (error.code === 'ERR_NETWORK') {
            console.error('🔌 Network Error: Backend server might not be running');
        }
        return Promise.reject(error);
    }
);
