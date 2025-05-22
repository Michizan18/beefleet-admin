// Cargas.jsx
import React from 'react';
import NavBar from '../components/NavBar';
import './Cargas.css';

const Cargas = () => {
  return (
    <div className="cargas-container">
      <NavBar />
      <div className="cargas-content">
        <h1>Gestión de Cargas</h1>
        
        {/* Barra de búsqueda */}
        <div className="search-bar">
          <input type="text" placeholder="Buscar por referencia, cliente o destino" />
          <button className="btn-add">+ Nueva Carga</button>
        </div>

        {/* Tabla de cargas */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Cliente</th>
                <th>Destino</th>
                <th>Vehículo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Ejemplo de fila - los datos vendrían de una API */}
              <tr>
                <td>CARGA-001</td>
                <td>Empresa A</td>
                <td>Ciudad X</td>
                <td>ABC-123</td>
                <td><span className="status-active">En tránsito</span></td>
                <td>
                  <button className="btn-view">Ver</button>
                  <button className="btn-edit">Editar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Cargas;