import { useState, useEffect, useCallback } from 'react';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener el token de autenticación
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
  }, []);

  // Función mejorada para procesar la respuesta de MySQL
  const processMySQLResponse = useCallback((rawData) => {
    try {
      if (!rawData) return [];
      
      if (Array.isArray(rawData)) {
        if (rawData.length > 0 && Array.isArray(rawData[0])) {
          return rawData[0].filter(item => item?.id_cliente);
        }
        return rawData.filter(item => item?.id_cliente);
      }
      
      if (rawData?.id_cliente) {
        return [rawData];
      }
      
      return [];
    } catch (error) {
      console.error('Error processing MySQL response:', error);
      return [];
    }
  }, []);

  // Función para obtener todos los clientes
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:3001/api/clients', {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
          return;
        }
        throw new Error(errorText || 'Error al obtener los clientes');
      }

      const data = await response.json();
      const processedData = processMySQLResponse(data);
      
      if (!processedData.length) {
        setError('No se encontraron clientes');
      }
      
      setClients(processedData);
      
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError(`Error al cargar los clientes: ${error.message}`);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, processMySQLResponse]);

  // Cargar clientes al usar el hook
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    fetchClients,
    refetch: fetchClients
  };
};

// Utility functions para clientes
export const clientUtils = {
  findClientByNit: (clients, nit) => clients.find(client => client.nit === nit),
  getClientNitsList: (clients) => clients.map(client => ({
    nit: client.nit,
    empresa: client.empresa,
    displayText: `${client.nit} - ${client.empresa || 'Sin empresa'}`
  })),
  checkNitExists: (clients, nit) => clients.some(client => client.nit === nit)
};