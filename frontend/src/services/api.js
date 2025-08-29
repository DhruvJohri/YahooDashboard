import axios from 'axios';


// Configure axios with base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const fetchCompanies = async () => {
  try {
    const response = await api.get('/companies');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch companies');
  }
};

export const fetchCompanyBySymbol = async (symbol) => {
  try {
    const response = await api.get(`/companies/${symbol}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch company: ${symbol}`);
  }
};

export const triggerScraper = async () => {
  try {
    const response = await api.post('/scrape');
    return response.data;
  } catch (error) {
    throw new Error('Failed to trigger scraper');
  }
};

export const fetchStats = async () => {
  try {
    const response = await api.get('/stats');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch stats');
  }
};

export default api;