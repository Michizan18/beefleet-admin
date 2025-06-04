import React, { useState, useEffect } from 'react';
import './VentasForm.css';

const VentasForm = ({ venta, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    fecha: '',
    valor: '',
    descripcion: '',
    carga: ''
  });

  const [errors, setErrors] = useState({});
  const [cargasDisponibles] = useState([
    'CARGA-001',
    'CARGA-002', 
    'CARGA-003',
    'CARGA-004',
    'CARGA-005'
  ]);

  useEffect(() => {
    if (venta) {
      setFormData({
        fecha: venta.fecha || '',
        valor: venta.valor || '',
        descripcion: venta.descripcion || '',
        carga: venta.carga || ''
      });
    } else {
      // Para nueva venta, establecer fecha actual
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        fecha: today
      }));
    }
  }, [venta]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fecha.trim()) {
      newErrors.fecha = 'La fecha es obligatoria';
    }

    if (!formData.valor) {
      newErrors.valor = 'El valor es obligatorio';
    } else if (isNaN(formData.valor) || parseFloat(formData.valor) <= 0) {
      newErrors.valor = 'El valor debe ser un número mayor a 0';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.trim().length < 5) {
      newErrors.descripcion = 'La descripción debe tener al menos 5 caracteres';
    }

    if (!formData.carga.trim()) {
      newErrors.carga = 'Debe seleccionar una carga';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const ventaData = {
        ...formData,
        valor: parseFloat(formData.valor),
        fecha: formData.fecha,
        // Si es edición, mantener el ID existente
        ...(venta && { id_venta: venta.id_venta })
      };
      
      onSave(ventaData);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('es-CO').format(value);
  };

  const handleValorChange = (e) => {
    // Permitir solo números
    const value = e.target.value.replace(/[^\d]/g, '');
    setFormData(prev => ({
      ...prev,
      valor: value
    }));

    if (errors.valor) {
      setErrors(prev => ({
        ...prev,
        valor: ''
      }));
    }
  };

  return (
    <div className="ventas-form-overlay">
      <div className="ventas-form-container">
        <div className="ventas-form-header">
          <div className="form-title">
            <span className="form-icon">📊</span>
            <h2>{venta ? 'Editar Venta' : 'Registrar Nueva Venta'}</h2>
          </div>
          <button className="btn-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ventas-form">
          <div className="form-section">
            <h3>Información Básica</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fecha">Fecha</label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className={errors.fecha ? 'error' : ''}
                />
                {errors.fecha && <span className="error-message">{errors.fecha}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="carga">Carga Asociada</label>
                <select
                  id="carga"
                  name="carga"
                  value={formData.carga}
                  onChange={handleChange}
                  className={errors.carga ? 'error' : ''}
                >
                  <option value="">Seleccionar carga</option>
                  {cargasDisponibles.map(carga => (
                    <option key={carga} value={carga}>{carga}</option>
                  ))}
                </select>
                {errors.carga && <span className="error-message">{errors.carga}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción de la venta"
                rows="4"
                className={errors.descripcion ? 'error' : ''}
              />
              {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="valor">Valor</label>
              <div className="valor-input-container">
                <span className="currency-symbol">$</span>
                <input
                  type="text"
                  id="valor"
                  name="valor"
                  value={formatCurrency(formData.valor)}
                  onChange={handleValorChange}
                  placeholder="500,000"
                  className={`valor-input ${errors.valor ? 'error' : ''}`}
                />
              </div>
              {errors.valor && <span className="error-message">{errors.valor}</span>}
              <small className="form-hint">Ingrese el valor en pesos colombianos</small>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              <span className="btn-icon">💾</span>
              {venta ? 'Actualizar Venta' : 'Guardar Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VentasForm;