import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaBell } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import './MenuNotificaciones.css';

const MenuNotificaciones = ({ userData }) => {
  const navigate = useNavigate();
  
  // Función para manejar clic en "Ver todas"
  const handleVerTodas = () => {
    navigate('/notificaciones'); // Cambié de './notificaciones' a '/notificaciones'
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="link" id="dropdown-notificaciones" className="notification-bell">
        <FaBell />
        {userData?.notificaciones?.length > 0 && (
          <span className="notification-badge">{userData.notificaciones.length}</span>
        )}
      </Dropdown.Toggle>
      
      <Dropdown.Menu className="dropdown-menu-end notification-dropdown">
        <h6 className="dropdown-header">Notificaciones</h6>
        
        {userData?.notificaciones?.length > 0 ? (
          userData.notificaciones.map(notif => (
            <Dropdown.Item 
              key={notif.id} 
              className={`notification-item ${notif.tipo}`}
              // Opcional: Si quieres que cada notificación individual también pueda llevarte a la pantalla
              // onClick={() => navigate('/notificaciones')}
            >
              <div className="notification-text">{notif.texto}</div>
              <div className="notification-time">{notif.tiempo}</div>
            </Dropdown.Item>
          ))
        ) : (
          <Dropdown.Item className="text-muted text-center">
            No hay notificaciones
          </Dropdown.Item>
        )}
        
        <Dropdown.Divider />
        
        {/* Botón "Ver todas" que navega a NotificacionesAdmin */}
        <Dropdown.Item 
          className="text-center ver-todas-link"
          onClick={handleVerTodas}
        >
          Ver todas
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default MenuNotificaciones;