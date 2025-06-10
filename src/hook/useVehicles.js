import { useState, useEffect } from 'react';
import axios from 'axios';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No hay token de autenticación');
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/vehicles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setVehicles(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar vehículos');
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return { vehicles, loading, error };
};

export const vehicleUtils = {
  findVehicleById: (vehicles, id) => {
    if (!vehicles || !id) return null;
    return vehicles.find(v => v.id == id || v.id_vehiculo == id);
  },
  
  getVehiclesList: (vehicles) => {
    if (!vehicles) return [];
    return vehicles.map(v => ({
      id: v.id || v.id_vehiculo,
      displayText: `${v.placa || 'Sin placa'} - ${(v.marca || '')} ${(v.modelo || '')}`.trim()
    }));
  }
};