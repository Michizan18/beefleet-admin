import { useState, useEffect } from 'react';
import axios from 'axios';

export const useDrivers = () => {
  const [drivers, setDrivers] = useState([]);
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

        const response = await axios.get('/api/drivers', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setDrivers(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching drivers:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar conductores');
        setDrivers([]);
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
    if (!drivers || !id) return null;
    return drivers.find(d => d.id == id || d.id_conductor == id);
  },
  
  getDriversList: (drivers) => {
    if (!drivers) return [];
    return drivers.map(d => ({
      id: d.id || d.id_conductor,
      displayText: `${d.documento || d.cedula || 'Sin doc'} - ${(d.nombre_conductor || '')} ${(d.apellido || '')}`.trim()
    }));
  }
};