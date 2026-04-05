import axios from 'axios';

let API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
if (API_BASE && !API_BASE.startsWith('http')) {
    API_BASE = `https://${API_BASE}`;
}
const API_URL = `${API_BASE}/api`;

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
