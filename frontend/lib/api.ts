import axios from 'axios';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5000/api';
console.log('Teamee API Base URL:', API_BASE_URL); // Debugging

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
