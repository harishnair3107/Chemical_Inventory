import axios from 'axios';

// Automatic URL Formatting for Production/Development
let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Remove trailing slash if present
rawUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
// Append /api if missing (e.g., if user only provided the domain)
const BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

console.log('--- API CONFIGURATION ---');
console.log('Raw URL:', rawUrl);
console.log('Final Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging outgoing calls
api.interceptors.request.use((config) => {
  console.log(`🚀 API Request: [${config.method.toUpperCase()}] ${config.baseURL}${config.url}`);
  return config;
}, (error) => Promise.reject(error));

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: [${response.config.method.toUpperCase()}] ${response.config.url}`);
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || 'A network error occurred';
    const fullUrl = error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown';
    console.error(`❌ API Error: [${error.config?.method?.toUpperCase()}] ${fullUrl}`);
    console.error(`Error Details:`, message);
    return Promise.reject(error);
  }
);

export default api;
