import React from 'react';
import { Navbar, Container, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaUsers, FaCar, FaChartLine, FaBell, 
  FaCalendarAlt, FaUserCircle, FaSignOutAlt, FaCog
} from 'react-icons/fa';
import './LayoutBarButton.css';

const LayoutBarButton = ({ children, userData }) => {
  // Usar useLocation para determinar la ruta actual y aplicar estilos active
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="dashboard-container">
      {/* Barra de navegación superior */}
      <nav className="navbar navbar-expand navbar-dark bg-warning fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="#!">
            <strong>Bienvenido Admin</strong>
          </a>
          
          <ul className="navbar-nav ms-auto">
            <li className="nav-item dropdown">
              <Dropdown>
                <Dropdown.Toggle variant="transparent" id="notification-dropdown" className="nav-link">
                  <FaBell className="icon" />
                  <span className="badge rounded-pill bg-danger">
                    {userData?.notificaciones?.length || 0}
                  </span>
                </Dropdown.Toggle>
                
                <Dropdown.Menu className="dropdown-menu-end notification-dropdown">
                  <h6 className="dropdown-header">Notificaciones</h6>
                  {userData?.notificaciones?.map(notif => (
                    <Dropdown.Item key={notif.id} className={`notification-item ${notif.tipo}`}>
                      <div className="notification-text">{notif.texto}</div>
                      <div className="notification-time">{notif.tiempo}</div>
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Divider />
                  <Dropdown.Item className="text-center">Ver todas</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </li>
            
            <li className="nav-item dropdown">
              <Dropdown>
                <Dropdown.Toggle variant="transparent" id="user-dropdown" className="nav-link">
                  <FaUserCircle className="icon" />
                  <span className="d-none d-md-inline-block ms-1">
                    {userData?.adminName || 'Usuario'}
                  </span>
                </Dropdown.Toggle>
                
                <Dropdown.Menu className="dropdown-menu-end">
                  <Dropdown.Item as={Link} to="/profile">
                    <FaUserCircle className="me-2" /> Mi Perfil
                  </Dropdown.Item>
                  <Dropdown.Item href="#!">
                    <FaCog className="me-2" /> Configuración
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item href="#!">
                    <FaSignOutAlt className="me-2" /> Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* Menú de botones horizontal */}
      <div className="header-menu">
        <div className="header-buttons">
          <Link 
            to="/dashboard" 
            className={`header-button ${currentPath === '/dashboard' ? 'active' : ''}`}
          >
            <FaChartLine className="icon" /> Dashboard
          </Link>
          <Link 
            to="/conductores" 
            className={`header-button ${currentPath === '/conductores' ? 'active' : ''}`}
          >
            <FaUsers className="icon" /> Conductores
          </Link>
          <Link 
            to="/vehiculos" 
            className={`header-button ${currentPath === '/vehiculos' ? 'active' : ''}`}
          >
            <FaCar className="icon" /> Vehículos
          </Link>
          <Link 
            to="/calendario" 
            className={`header-button ${currentPath === '/rutas' ? 'active' : ''}`}
          >
            <FaCalendarAlt className="icon" /> Rutas
          </Link>
                    <Link 
            to="/calendario" 
            className={`header-button ${currentPath === '/cargas' ? 'active' : ''}`}
          >
            <FaCalendarAlt className="icon" /> Cargas
          </Link>
          <Link 
            to="/profile" 
            className={`header-button ${currentPath === '/AdminProfile' ? 'active' : ''}`}
          >
            <FaUserCircle className="icon" /> Mi Perfil
          </Link>
        </div>
      </div>
      
      {/* Contenido principal */}
      <main className="content">
        <Container fluid>
          {children}
        </Container>
      </main>
    </div>
  );
};

export default LayoutBarButton;