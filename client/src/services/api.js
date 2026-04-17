import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://rogveda.onrender.com/api',
  timeout: 60000, // Increased to 60 seconds to allow Render free tier wakeups
  headers: { 'Content-Type': 'application/json' },
});

// Attach vendor token to requests when available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('vendor_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
