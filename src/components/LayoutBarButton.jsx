import React, { useState } from 'react';
import { Navbar, Container, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import MenuNotificaciones from './MenuNotificaciones';
import { 
  FaUsers, FaCar, FaChartLine, FaBell, 
  FaCalendarAlt, FaUserCircle, FaSignOutAlt, FaCog, FaMapMarkedAlt, FaTruckLoading,
} from 'react-icons/fa';
import { FaPeopleCarryBox, FaMoneyBillWave } from "react-icons/fa6";
import { GiReceiveMoney } from "react-icons/gi";
import './LayoutBarButton.css';
import logo from './img/logo.png'; // Asegúrate de tener una imagen de logo si es necesario

const LayoutBarButton = ({ children, userData }) => {
  const [user, setUser ] = useState(null)
  // Usar useLocation para determinar la ruta actual y aplicar estilos active
  const location = useLocation();
  const currentPath = location.pathname;
  useEffect(() => {
      const fetchData = () => {
        const userStorage = localStorage.getItem('veterinario');
        if (userStorage) {
          setUser(JSON.parse(userStorage));
        }
      };
      fetchData();
    }, []);

  return (
    <div className="dashboard-container">
      {/* Barra de navegación superior */}
      <nav className="navbar navbar-expand navbar-dark bg-warning fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="#!">
            <img 
              src={logo} 
              alt="Logo" 
              style={{ height: '105px', marginRight: '30px' }} 
            />
            <strong>Bienvenido Admin</strong>
          </a>
          
          <ul className="navbar-nav ms-auto">
  <li className="nav-item">
    {/* Usa el componente MenuNotificaciones en lugar del código duplicado */}
    <MenuNotificaciones userData={userData} />
  </li>
            
            <li className="nav-item dropdown">
              <Dropdown>
                <Dropdown.Toggle variant="transparent" id="user-dropdown" className="nav-link">
                  <FaUserCircle className="icon" />
                  <span className="d-none d-md-inline-block ms-1">
                    {user.nombre_usuario || 'Usuario'}
                  </span>
                </Dropdown.Toggle>
                
                <Dropdown.Menu className="dropdown-menu-end">
                  <Dropdown.Item as={Link} to="/profile">
                    <FaUserCircle className="me-2" /> Mi Perfil
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/configuraciones">
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
            to="/rutas" 
            className={`header-button ${currentPath === '/rutas' ? 'active' : ''}`}
          >
            <FaMapMarkedAlt className="icon" /> Rutas
          </Link>
          <Link 
            to="/cargas" 
            className={`header-button ${currentPath === '/cargas' ? 'active' : ''}`}
          >
            <FaTruckLoading className="icon" /> Cargas
            
          </Link>
                    <Link 
            to="/clientes" 
            className={`header-button ${currentPath === '/clientes' ? 'active' : ''}`}
          >
            <FaPeopleCarryBox className="icon" /> Clientes
            
          </Link>
                    <Link 
            to="/ventas" 
            className={`header-button ${currentPath === '/ventas' ? 'active' : ''}`}
          >
            <FaMoneyBillWave  className="icon" /> Ventas
            
          </Link>
                    <Link 
            to="/gastos" 
            className={`header-button ${currentPath === '/gastos' ? 'active' : ''}`}
          >
            <GiReceiveMoney className="icon" /> Gastos
            
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