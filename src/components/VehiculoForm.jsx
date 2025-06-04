// src/components/VehiculoForm.jsx
import React, { useState, useEffect } from 'react';
import './VehiculoForm.css';

const VehiculoForm = ({ vehiculo, onSubmit, conductores, onCancel }) => {
  const [formData, setFormData] = useState({
    id_vehiculo: '',
    placa: '',
    modelo: '',
    peso: '',
    matricula: '',
    seguro: '',
    estado_vehiculo: 'Activo',
    conductor: ''
  });

  useEffect(() => {
    if (vehiculo) {
      setFormData(vehiculo);
    }
  }, [vehiculo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="vehiculo-form">
      <h2>{vehiculo ? 'Editar Vehículo' : 'Agregar Vehículo'}</h2>
      
      <div className="form-group">
        <label htmlFor="placa">Placa</label>
        <input
          id="placa"
          name="placa"
          type="text"
          value={formData.placa}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="modelo">Modelo</label>
        <input
          id="modelo"
          name="modelo"
          type="text"
          value={formData.modelo}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="peso">Peso (kg)</label>
        <input
          id="peso"
          name="peso"
          type="number"
          value={formData.peso}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="matricula">Matrícula</label>
        <input
          id="matricula"
          name="matricula"
          type="text"
          value={formData.matricula}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="seguro">Número de Seguro</label>
        <input
          id="seguro"
          name="seguro"
          type="text"
          value={formData.seguro}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="estado_vehiculo">Estado</label>
        <select
          id="estado_vehiculo"
          name="estado_vehiculo"
          value={formData.estado_vehiculo}
          onChange={handleChange}
        >
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
          <option value="En Mantenimiento">En Mantenimiento</option>
          <option value="Fuera de Servicio">Fuera de Servicio</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="conductor">Conductor</label>
        <select
          id="conductor"
          name="conductor"
          value={formData.conductor}
          onChange={handleChange}
        >
          <option value="">Seleccionar conductor</option>
          {conductores && conductores.map(conductor => (
            <option key={conductor.id} value={conductor.id}>
              {conductor.nombre}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-buttons">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-submit">
          {vehiculo ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default VehiculoForm;