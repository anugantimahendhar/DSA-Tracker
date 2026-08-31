import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Supabase JWT Token to all outgoing requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const localToken = localStorage.getItem('dsa_tracker_token');
      if (localToken) {
        config.headers.Authorization = `Bearer ${localToken}`;
      }
    }
  } catch {
    const localToken = localStorage.getItem('dsa_tracker_token');
    if (localToken) {
      config.headers.Authorization = `Bearer ${localToken}`;
    }
  }
  return config;
});

// Global Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('dsa_tracker_token');
        localStorage.removeItem('dsa_tracker_user');
      }
    }
    return Promise.reject(error);
  }
);