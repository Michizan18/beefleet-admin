import React, { useState } from 'react';
import './Clientes.css';
import ClienteForm from '../components/ClienteForm';

const Clientes = () => {
  const [clientes, setClientes] = useState([
    // Datos de ejemplo
    {
      id_cliente: '1',
      tipo_documento: 'CC',
      documento: '123456789',
      nombre_cliente: 'Juan',
      apellido_cliente: 'Pérez',
      direccion: 'Calle 123 #45-67',
      ciudad: 'Bogotá',
      telefono: '3001234567',
      empresa: 'Empresa A'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [currentCliente, setCurrentCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddCliente = () => {
    setCurrentCliente(null);
    setShowForm(true);
  };

  const handleEditCliente = (cliente) => {
    setCurrentCliente(cliente);
    setShowForm(true);
  };

  const handleSubmit = (clienteData) => {
    if (currentCliente) {
      // Editar cliente existente
      setClientes(clientes.map(c => 
        c.id_cliente === currentCliente.id_cliente ? clienteData : c
      ));
    } else {
      // Agregar nuevo cliente
      const newCliente = {
        ...clienteData,
        id_cliente: (clientes.length + 1).toString()
      };
      setClientes([...clientes, newCliente]);
    }
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const filteredClientes = clientes.filter(cliente =>
    Object.values(cliente).some(
      value => value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="clientes-container">
      <h1>Gestión de Clientes</h1>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por documento, nombre, empresa o ciudad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-btn" onClick={handleAddCliente}>
          + Nuevo Cliente
        </button>
      </div>

      {showForm ? (
        <ClienteForm
          cliente={currentCliente}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <div className="clientes-list">
          <table>
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Empresa</th>
                <th>Ciudad</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map(cliente => (
                <tr key={cliente.id_cliente}>
                  <td>{cliente.tipo_documento} {cliente.documento}</td>
                  <td>{cliente.nombre_cliente}</td>
                  <td>{cliente.apellido_cliente}</td>
                  <td>{cliente.empresa}</td>
                  <td>{cliente.ciudad}</td>
                  <td>{cliente.telefono}</td>
                  <td>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditCliente(cliente)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Clientes;