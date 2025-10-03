import axios from "axios";

// Extend Window interface to include Clerk
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
      redirectToSignIn: () => void;
    };
  }
}

// Use VITE_API_BASE_URL if set, otherwise default based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' ? "/api" : "http://localhost:5137/api");

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout for file uploads
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
    async (config: any) => {
        try {
            // Get fresh token from Clerk if available
            if (window.Clerk?.session) {
                const token = await window.Clerk.session.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (error) {
            // Silently fail for token refresh - don't block the request
            console.warn('Failed to get auth token:', error);
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response: any) => {
        return response;
    },
    async (error: any) => {
        const originalRequest = error.config;
        
        // Handle 401 errors with retry logic
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to get a fresh token
                if (window.Clerk?.session) {
                    const token = await window.Clerk.session.getToken();
                    if (token) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.warn('Token refresh failed:', refreshError);
            }
            
            // If token refresh fails, redirect to sign in
            if (window.Clerk) {
                window.Clerk.redirectToSignIn();
            }
        }
        
        // Handle network errors
        if (error.code === 'ERR_NETWORK') {
            console.error('Network error - server may be down');
        }
        
        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout - server took too long to respond');
        }
        
        return Promise.reject(error);
    }
);
