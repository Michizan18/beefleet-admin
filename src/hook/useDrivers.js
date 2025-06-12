import { useState, useEffect } from 'react';

export const useDrivers = () => {
  const [drivers, setDrivers] = useState([]); // Inicializar como array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No hay token de autenticación');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:3001/api/drivers', {
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
          throw new Error(errorText || 'Error al obtener los conductores');
        }

        const data = await response.json();
        
        // Asegurarnos que los datos son un array
        if (!Array.isArray(data)) {
          // Si la respuesta es un objeto con propiedad 'data' (común en APIs)
          if (data && Array.isArray(data.data)) {
            setDrivers(data.data);
          } else {
            throw new Error('Formato de datos inválido: se esperaba un array');
          }
        } else {
          setDrivers(data);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        setError(error.message || 'Error al cargar conductores');
        setDrivers([]); // Asegurar que siempre sea un array
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  return { drivers, loading, error };
};

export const driverUtils = {
  findDriverById: (drivers, id) => {
    if (!Array.isArray(drivers)) return null;
    return drivers.find(d => d.id == id || d.id_conductor == id);
  },
  
  getDriversList: (drivers) => {
    if (!Array.isArray(drivers)) return []; // Manejo seguro
    return drivers.map(d => ({
      id: d.id || d.id_conductor,
      displayText: `${d.documento || d.cedula || 'Sin doc'} - ${(d.nombre_conductor || '')} ${(d.apellido || '')}`.trim()
    }));
  }
};