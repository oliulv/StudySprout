import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const auth = {
  register: (data: { email: string; password: string }) => 
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => {
    // OAuth2 requires form-urlencoded data with username (not email)
    const params = new URLSearchParams();
    params.append('username', data.email);  // FastAPI OAuth2 expects 'username'
    params.append('password', data.password);
    
    // Send as form-urlencoded instead of JSON
    return api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  logout: () => api.post('/auth/logout')
};

// Sets endpoints
export const sets = {
  getAll: () => api.get('/sets'),
  getById: (id: number) => api.get(`/sets/${id}`),
  create: (data: { title: string; description: string; is_public: boolean }) => 
    api.post('/sets', data),
  update: (id: number, data: { title?: string; description?: string; is_public?: boolean }) => 
    api.put(`/sets/${id}`, data),
  delete: (id: number) => api.delete(`/sets/${id}`),
  getPublic: (query: string) => api.get('/search', { params: { q: query } })
};

// Cards endpoints
export const cards = {
  getAllForSet: (setId: number) => api.get(`/sets/${setId}/cards`),
  create: (setId: number, data: { term: string; definition: string; image_url?: string; audio_url?: string }) => 
    api.post(`/sets/${setId}/cards`, data),
  update: (setId: number, cardId: number, data: { term?: string; definition?: string; image_url?: string; audio_url?: string }) => 
    api.put(`/sets/${setId}/cards/${cardId}`, data),
  delete: (setId: number, cardId: number) => api.delete(`/sets/${setId}/cards/${cardId}`)
};

// Progress endpoints
export const progress = {
  updateCardProgress: (cardId: number, data: { mastery_level: number }) => 
    api.post(`/progress`, { card_id: cardId, ...data }),
  getUserProgress: () => api.get('/progress')
};

const apiService = {
  auth,
  sets,
  cards,
  progress
};

export default apiService;
