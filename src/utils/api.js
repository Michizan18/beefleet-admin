const API_BASE_URL = 'http://localhost:3001';

// Función utilitaria para hacer requests con manejo de errores
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
    
    // Manejar errores de autenticación
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      // Redirigir al login o mostrar mensaje
      window.location.href = '/login';
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Error ${response.status}`;
      
      try {
        const parsedError = JSON.parse(errorData);
        errorMessage = parsedError.message || errorMessage;
      } catch (e) {
        errorMessage = errorData || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error);
    throw error;
  }
};