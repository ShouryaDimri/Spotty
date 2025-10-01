import axios from "axios";

// Use VITE_API_BASE_URL if set, otherwise default based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' ? "/api" : "http://localhost:5137/api");

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

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response: any) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error: any) => {
        console.error('❌ API Error:', error.message);
        if (error.code === 'ERR_NETWORK') {
            console.error('🔌 Network Error: Backend server might not be running');
        }
        return Promise.reject(error);
    }
);
