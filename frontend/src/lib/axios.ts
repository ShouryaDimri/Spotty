import axios from "axios";
import { Clerk } from "@clerk/clerk-react";

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
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// Add request interceptor to ensure token is fresh
axiosInstance.interceptors.request.use(
    async (config: any) => {
        try {
            // Get token from Clerk if available
            if (window.Clerk?.session) {
                const token = await window.Clerk.session.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (error) {
            // Silently fail for token refresh
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
        return response;
    },
    async (error: any) => {
        // Handle 401 errors more gracefully
        if (error.response?.status === 401) {
            console.warn('Authentication required - user may need to sign in');
            // Don't automatically sign out, let the component handle it
        }
        
        // Handle network errors
        if (error.code === 'ERR_NETWORK') {
            console.error('Network error - server may be down');
        }
        
        return Promise.reject(error);
    }
);
