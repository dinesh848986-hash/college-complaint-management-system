import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to append JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if we're already on login/register
      const isAuthPath =
        window.location.pathname === '/login' ||
        window.location.pathname === '/register';
      if (!isAuthPath) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const complaintAPI = {
  getComplaints: async (params = {}) => {
    const res = await api.get('/complaints', { params });
    return res.data;
  },
  getComplaintById: async (id) => {
    const res = await api.get(`/complaints/${id}`);
    return res.data;
  },
  createComplaint: async (formData) => {
    // Note: formData should be an instance of FormData for multipart/form-data
    const res = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  getAdminComplaints: async (params = {}) => {
    const res = await api.get('/complaints/admin', { params });
    return res.data;
  },
  updateComplaint: async (id, updateData) => {
    const res = await api.patch(`/complaints/${id}`, updateData);
    return res.data;
  },
  deleteComplaint: async (id) => {
    const res = await api.delete(`/complaints/${id}`);
    return res.data;
  },
};

export default api;
