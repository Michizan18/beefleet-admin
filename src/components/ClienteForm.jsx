import React from 'react';
import './ClienteForm.css';

const ClienteForm = ({ cliente, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState(cliente || {
    id_cliente: '',
    tipo_documento: '',
    documento: '',
    nombre_cliente: '',
    apellido_cliente: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    empresa: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="cliente-form" onSubmit={handleSubmit}>
      <h2>{cliente ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</h2>
      
      <div className="form-group">
        <label>Tipo de Documento</label>
        <select 
          name="tipo_documento" 
          value={formData.tipo_documento}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar...</option>
          <option value="CC">Cédula de Ciudadanía</option>
          <option value="NIT">NIT</option>
          <option value="CE">Cédula de Extranjería</option>
          <option value="PAS">Pasaporte</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Número de Documento</label>
          <input
            type="text"
            name="documento"
            value={formData.documento}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            name="nombre_cliente"
            value={formData.nombre_cliente}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Apellido</label>
          <input
            type="text"
            name="apellido_cliente"
            value={formData.apellido_cliente}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Dirección</label>
        <input
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Ciudad</label>
          <input
            type="text"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Empresa</label>
          <input
            type="text"
            name="empresa"
            value={formData.empresa}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="submit-btn">
          {cliente ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>
  );
};

export default ClienteForm;