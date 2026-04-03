import axios from 'axios';

// The base URL defaults to localhost:5000 for development, 
// but can be overridden by VITE_API_URL in production (e.g. Render/Vercel)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'A network error occurred';
    console.error(`API Error [${error.config.url}]:`, message);
    return Promise.reject(error);
  }
);

export default api;
