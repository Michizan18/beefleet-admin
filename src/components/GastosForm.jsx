import React, { useState } from 'react';
import { FaReceipt, FaCalendarAlt, FaDollarSign, FaFileAlt, FaTag, FaBuilding } from 'react-icons/fa';
import './GastosForm.css';

const GastosForm = () => {
  const [gasto, setGasto] = useState({
    descripcion: '',
    categoria: '',
    monto: '',
    fecha: '',
    proveedor: '',
    numeroFactura: '',
    metodoPago: 'efectivo',
    observaciones: ''
  });

  const categorias = [
    'Combustible',
    'Mantenimiento',
    'Peajes',
    'Alimentación',
    'Hospedaje',
    'Repuestos',
    'Servicios',
    'Otros'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGasto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Gasto registrado:', gasto);
    // Aquí iría la lógica para guardar el gasto
    alert('Gasto registrado exitosamente');
    
    // Limpiar formulario
    setGasto({
      descripcion: '',
      categoria: '',
      monto: '',
      fecha: '',
      proveedor: '',
      numeroFactura: '',
      metodoPago: 'efectivo',
      observaciones: ''
    });
  };

  return (
    <div className="gastos-form-container">
      <div className="form-header">
        <FaReceipt className="header-icon" />
        <h2>Registro de Gastos</h2>
      </div>

      <form onSubmit={handleSubmit} className="gastos-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="descripcion">
              <FaFileAlt className="label-icon" />
              Descripción del Gasto
            </label>
            <input
              type="text"
              id="descripcion"
              name="descripcion"
              value={gasto.descripcion}
              onChange={handleInputChange}
              placeholder="Describe el gasto realizado"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoria">
              <FaTag className="label-icon" />
              Categoría
            </label>
            <select
              id="categoria"
              name="categoria"
              value={gasto.categoria}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="monto">
              <FaDollarSign className="label-icon" />
              Monto
            </label>
            <input
              type="number"
              id="monto"
              name="monto"
              value={gasto.monto}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha">
              <FaCalendarAlt className="label-icon" />
              Fecha
            </label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={gasto.fecha}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="proveedor">
              <FaBuilding className="label-icon" />
              Proveedor/Establecimiento
            </label>
            <input
              type="text"
              id="proveedor"
              name="proveedor"
              value={gasto.proveedor}
              onChange={handleInputChange}
              placeholder="Nombre del proveedor"
            />
          </div>

          <div className="form-group">
            <label htmlFor="numeroFactura">
              <FaReceipt className="label-icon" />
              Número de Factura
            </label>
            <input
              type="text"
              id="numeroFactura"
              name="numeroFactura"
              value={gasto.numeroFactura}
              onChange={handleInputChange}
              placeholder="No. de factura o recibo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="metodoPago">
              <FaDollarSign className="label-icon" />
              Método de Pago
            </label>
            <select
              id="metodoPago"
              name="metodoPago"
              value={gasto.metodoPago}
              onChange={handleInputChange}
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label htmlFor="observaciones">
              <FaFileAlt className="label-icon" />
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={gasto.observaciones}
              onChange={handleInputChange}
              placeholder="Información adicional sobre el gasto"
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Registrar Gasto
          </button>
        </div>
      </form>
    </div>
  );
};

export default GastosForm;