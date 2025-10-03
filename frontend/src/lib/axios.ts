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
        // Handle 401 errors by redirecting to login
        if (error.response?.status === 401) {
            // Clear any stored auth data
            if (window.Clerk) {
                await window.Clerk.signOut();
            }
        }
        
        return Promise.reject(error);
    }
);
