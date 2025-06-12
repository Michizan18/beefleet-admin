import { useState, useEffect } from 'react';

export const useClients = () => {
  const [clients, setClients] = useState([]); // Inicializar como array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No hay token de autenticación');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:3001/api/clients', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
          }
          throw new Error(errorText || 'Error al obtener los clientes');
        }

        const data = await response.json();
        
        // Asegurarnos que los datos son un array
        if (!Array.isArray(data)) {
          // Si la respuesta es un objeto con propiedad 'data' (común en APIs)
          if (data && Array.isArray(data.data)) {
            setClients(data.data);
          } else {
            throw new Error('Formato de datos inválido: se esperaba un array');
          }
        } else {
          setClients(data);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError(error.message || 'Error al cargar clientes');
        setClients([]); // Asegurar que siempre sea un array
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return { clients, loading, error };
};

export const clientUtils = {
  findClientByNit: (clients, nit) => {
    if (!Array.isArray(clients)) return null;
    return clients.find(c => c.nit == nit || c.id_cliente == nit);
  },
  
  getClientsList: (clients) => {
    if (!Array.isArray(clients)) return []; // Manejo seguro
    return clients.map(c => ({
      nit: c.nit || c.id_cliente,
      displayText: `${c.nit || c.id_cliente || 'Sin NIT'} - ${c.empresa || c.nombre_empresa || 'Sin empresa'}`
    }));
  }
};