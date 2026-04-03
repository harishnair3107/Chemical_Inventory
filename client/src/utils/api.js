import axios from 'axios';

// Automatic URL Formatting for Production/Development
let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Remove trailing slash if present
rawUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
// Append /api if missing (e.g., if user only provided the domain)
const BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

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
