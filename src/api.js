import axios from 'axios';

// 1. Configuración base de Axios
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // URL de tu backend
});

// 2. Interceptor para añadir el token JWT a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Obtén el token del almacenamiento local
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Añade el token al header
  }
  return config;
});

// 3. Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // Redirige a login si el token expira o es inválido
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;