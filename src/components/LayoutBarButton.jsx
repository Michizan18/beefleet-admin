import React, { useState , useCallback, useEffect} from 'react';
import { Navbar, Container, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import MenuNotificaciones from './MenuNotificaciones';
import { 
  FaUsers, FaCar, FaChartLine, FaBell, 
  FaCalendarAlt, FaUserCircle, FaSignOutAlt, FaCog, FaMapMarkedAlt, FaTruckLoading,
  FaTruck, FaRoute
} from 'react-icons/fa';
import { FaPeopleCarryBox, FaMoneyBillWave } from "react-icons/fa6";
import { GiReceiveMoney } from "react-icons/gi";
import './LayoutBarButton.css';
import logo from './img/logo.png'; // Asegúrate de tener una imagen de logo si es necesario

const LayoutBarButton = ({ children} ) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  const [error, setError] = useState(null);
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
  }, []);

  // Función para obtener los datos del perfil del administrador
    const fetchAdminProfile = useCallback(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = getAuthToken();
        const id_usuario = localStorage.getItem('id_usuario');
        
        console.log('Token:', token); // Debug
        console.log('ID Usuario:', id_usuario); // Debug
        
        if (!token || !id_usuario) {
          setError('No hay información de autenticación');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`http://localhost:3001/api/admin`, {
          method: 'GET',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response status:', response.status); // Debug
        console.log('Response ok:', response.ok); // Debug
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('id_usuario');
            setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
            return;
          }
          
          // Obtener texto del error para más información
          const errorText = await response.text();
          console.error('Error response:', errorText); // Debug
          throw new Error(`Error ${response.status}: ${errorText || 'Error al obtener los datos del perfil'}`);
        }
  
        const data = await response.json();
        console.log('Data received:', data); // Debug
        setUserData(data);
        
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        setError(`Error al cargar el perfil: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }, [getAuthToken]);

    useEffect(() => {
        fetchAdminProfile();
    }, [fetchAdminProfile]);
  // Usar useLocation para determinar la ruta actual y aplicar estilos active
  const location = useLocation();
  const currentPath = location.pathname;
  // const [userData, setUserData] = useState([]);

  // const parced = localStorage.getItem('usuario');
  // if (parced) {
  //   const parced2 = JSON.parse(parced);
  //   const userStorage = parced2.user;
  //   if (userStorage) {
  //     setUserData(userStorage);
  //   }
  // }


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
    <MenuNotificaciones  />
  </li>
            
            <li className="nav-item dropdown">
              <Dropdown>
                <Dropdown.Toggle variant="transparent" id="user-dropdown" className="nav-link">
                  <FaUserCircle className="icon" />
                  <span className="d-none d-md-inline-block ms-1">
                    {userData.nombre_usuario + ' ' + userData.apellido_usuario || 'Usuario'}
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
            <FaTruck className="icon" /> Vehículos
          </Link>
          <Link 
            to="/rutas" 
            className={`header-button ${currentPath === '/rutas' ? 'active' : ''}`}
          >
            <FaRoute className="icon" /> Rutas
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
            to="/profile" 
            className={`header-button ${currentPath === '/Profile' ? 'active' : ''}`}
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