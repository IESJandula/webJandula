import axios from 'axios';
import { auth } from '@/firebaseConfig';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (token) => apiClient.post('/auth/login', { token });

// Noticias (profesor)
export const getMisNoticias = () => apiClient.get('/api/noticias/mis');
export const crearNoticia = (data) => apiClient.post('/api/noticias', data);
export const editarNoticia = (id, data) => apiClient.put(`/api/noticias/${id}`, data);

// Admin
export const getAdminNoticias = (estado) =>
  apiClient.get('/api/admin/noticias', { params: estado ? { estado } : {} });
export const aprobarNoticia = (id) => apiClient.post(`/api/admin/noticias/${id}/aprobar`);
export const rechazarNoticia = (id, motivo) =>
  apiClient.post(`/api/admin/noticias/${id}/rechazar`, { motivo });
export const despublicarNoticia = (id) => apiClient.post(`/api/admin/noticias/${id}/despublicar`);
export const eliminarNoticia = (id) => apiClient.delete(`/api/admin/noticias/${id}`);
export const reordenarNoticias = (ids) => apiClient.put('/api/admin/noticias/orden', { ids });

// Uploads
export const subirImagen = (file) => {
  const form = new FormData();
  form.append('file', file);
  return apiClient.post('/api/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
