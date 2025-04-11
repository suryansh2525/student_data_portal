import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

// Student Services
export const studentService = {
  syncStudents: async () => {
    const response = await api.get('/students/sync');
    return response.data;
  },
  getStudents: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query params
    if (filters.active !== undefined) {
      params.append('active', filters.active);
    }
    if (filters.course) {
      params.append('course', filters.course);
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder || 'asc');
    }
    
    const response = await api.get(`/students?${params.toString()}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/students/stats');
    return response.data;
  },
};

export default api;