import { useState, useEffect } from 'react';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]); // Asegúrate de inicializar como array
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

        const response = await fetch('http://localhost:3001/api/vehicles', {
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
          throw new Error(errorText || 'Error al obtener los vehículos');
        }

        const data = await response.json();
        
        // Asegúrate de que data sea un array
        if (!Array.isArray(data)) {
          throw new Error('Formato de datos inválido: se esperaba un array');
        }

        setVehicles(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setError(error.message || 'Error al cargar vehículos');
        setVehicles([]); // Asegura que siempre sea un array
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
    if (!Array.isArray(vehicles)) return null;
    return vehicles.find(v => v.id == id || v.id_vehiculo == id);
  },
  
  getVehiclesList: (vehicles) => {
    if (!Array.isArray(vehicles)) return []; // Manejo seguro si no es array
    return vehicles.map(v => ({
      id: v.id || v.id_vehiculo,
      displayText: `${v.placa || 'Sin placa'} - ${(v.marca || '')} ${(v.modelo || '')}`.trim()
    }));
  }
};