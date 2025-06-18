import React, { useState, useEffect } from 'react';
import { Navbar, Container, Dropdown, Modal, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MenuNotificaciones from './MenuNotificaciones';
import {
  FaUsers, FaCar, FaChartLine, FaBell, 
  FaCalendarAlt, FaUserCircle, FaSignOutAlt, FaCog, FaMapMarkedAlt, FaTruckLoading,
  FaTruck, FaRoute
} from 'react-icons/fa';
import { FaPeopleCarryBox, FaMoneyBillWave } from "react-icons/fa6";
import { GiReceiveMoney } from "react-icons/gi";
import './LayoutBarButton.css';
import logo from './img/logo.png';

const LayoutBarButton = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  // Estado para el modal de confirmación de cierre de sesión
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [userData, setUserData] = useState({
    nombre_usuario: '',
    apellido_usuario: '',
    loading: true,
    error: null
  });

  // PROTECCIÓN CONTRA EL BOTÓN ATRÁS
  useEffect(() => {
    const preventBack = () => {
      window.history.pushState(null, null, window.location.pathname);
    };

    const handlePopState = (event) => {
      const token = localStorage.getItem('token');
      const usuario = localStorage.getItem('usuario');
      
      if (!token || !usuario) {
        window.history.pushState(null, null, '/login');
        navigate('/login', { replace: true });
      } else {
        preventBack();
      }
    };

    // Agregar estado al historial para prevenir el botón atrás
    preventBack();
    
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      // Obtener el token o ID del usuario del localStorage
      const userSession = localStorage.getItem('usuario');
      
      console.log('userSession raw:', userSession); // Debug
      
      if (!userSession) {
        console.error('No hay sesión de usuario');
        setUserData(prev => ({ 
          ...prev, 
          loading: false,
          error: 'No hay sesión de usuario'
        }));
        return;
      }

      const parsedSession = JSON.parse(userSession);
      console.log('parsedSession:', parsedSession); // Debug
      
      // Si ya tienes los datos en localStorage, úsalos directamente
      console.log('Verificando datos en localStorage:');
      console.log('nombre_usuario:', parsedSession.nombre_usuario);
      console.log('apellido_usuario:', parsedSession.apellido_usuario);
      
      if (parsedSession.nombre_usuario && parsedSession.apellido_usuario) {
        console.log('Usando datos del localStorage directamente');
        setUserData({
          nombre_usuario: parsedSession.nombre_usuario,
          apellido_usuario: parsedSession.apellido_usuario,
          loading: false,
          error: null
        });
        console.log('Estado actualizado con:', {
          nombre_usuario: parsedSession.nombre_usuario,
          apellido_usuario: parsedSession.apellido_usuario
        });
        return;
      } else {
        console.log('Datos no encontrados en localStorage, haciendo llamada a API');
      }
      
      const userId = parsedSession.user?.id || parsedSession.id || parsedSession.id_usuario;
      console.log('userId extraído:', userId); // Debug

      if (!userId) {
        console.error('No se encontró ID de usuario');
        setUserData(prev => ({ 
          ...prev, 
          loading: false,
          error: 'No se encontró ID de usuario'
        }));
        return;
      }

      // Llamada a tu API para obtener los datos del usuario
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Si usas autenticación por token, agrégalo aquí
          'Authorization': `Bearer ${parsedSession.token || ''}`
        }
      });

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userDataResponse = await response.json();
      
      // Manejar diferentes estructuras de respuesta posibles
      let userData = userDataResponse;
      
      // Si la respuesta es un array, tomar el primer elemento
      if (Array.isArray(userDataResponse) && userDataResponse.length > 0) {
        userData = userDataResponse[0];
      }
      
      // Si hay un array anidado (estructura de mysql2)
      if (userData && Array.isArray(userData) && userData.length > 0) {
        userData = userData[0];
      }
      
      console.log('Datos del usuario recibidos:', userData); // Para debug
      
      // Actualizar el estado con los datos del usuario
      setUserData({
        nombre_usuario: userData?.nombre_usuario || '',
        apellido_usuario: userData?.apellido_usuario || '',
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      setUserData({
        nombre_usuario: '',
        apellido_usuario: '',
        loading: false,
        error: error.message || 'Error al cargar datos del usuario'
      });
    }
  };

  // useEffect para cargar los datos cuando el componente se monte
  useEffect(() => {
    fetchUserData();
  }, []);

  // useEffect para debug - ver cuando cambia userData
  useEffect(() => {
    console.log('userData cambió:', userData);
  }, [userData]);

  // Función para obtener el nombre completo o un fallback
  const getDisplayName = () => {
    // Primero intentar con userData
    if (userData.nombre_usuario && userData.apellido_usuario) {
      const nombreCompleto = `${userData.nombre_usuario} ${userData.apellido_usuario}`.trim();
      console.log('getDisplayName - usando userData:', nombreCompleto);
      return nombreCompleto;
    }

    // Fallback: leer directamente de localStorage
    try {
      const userSession = localStorage.getItem('usuario');
      if (userSession) {
        const parsedSession = JSON.parse(userSession);
        if (parsedSession.nombre_usuario && parsedSession.apellido_usuario) {
          const nombreCompleto = `${parsedSession.nombre_usuario} ${parsedSession.apellido_usuario}`.trim();
          console.log('getDisplayName - usando localStorage:', nombreCompleto);
          return nombreCompleto;
        }
      }
    } catch (error) {
      console.error('Error leyendo localStorage en getDisplayName:', error);
    }
    
    if (userData.loading) return 'Cargando...';
    return 'Usuario';
  };

  // Función para obtener solo el nombre para el saludo
  const getGreetingName = () => {
    // Primero intentar con userData
    if (userData.nombre_usuario) {
      console.log('getGreetingName - usando userData:', userData.nombre_usuario);
      return userData.nombre_usuario;
    }

    // Fallback: leer directamente de localStorage
    try {
      const userSession = localStorage.getItem('usuario');
      if (userSession) {
        const parsedSession = JSON.parse(userSession);
        if (parsedSession.nombre_usuario) {
          console.log('getGreetingName - usando localStorage:', parsedSession.nombre_usuario);
          return parsedSession.nombre_usuario;
        }
      }
    } catch (error) {
      console.error('Error leyendo localStorage en getGreetingName:', error);
    }
    
    if (userData.loading) return 'Cargando...';
    return 'Admin';
  };

  // FUNCIÓN DE LOGOUT MEJORADA
  const handleLogout = () => {
    try {
      // Limpiar TODOS los datos
      localStorage.clear();
      sessionStorage.clear();
      
      // Limpiar cookies si las hay
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Prevenir el botón atrás agregando múltiples entradas al historial
      window.history.pushState(null, null, '/login');
      window.history.pushState(null, null, '/login');
      window.history.pushState(null, null, '/login');
      
      // Navegar al login
      navigate('/login', { replace: true });
      
      // Como respaldo adicional, forzar la recarga de la página
      setTimeout(() => {
        window.location.replace('/login');
      }, 100);
      
    } catch (error) {
      console.error('Error durante el logout:', error);
      // Como último recurso
      window.location.href = '/login';
    }
  };

  // Función para abrir el modal de confirmación
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // Función para cerrar el modal sin hacer logout
  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Función para confirmar y proceder con el logout
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

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
            <strong>Bienvenido {getGreetingName()}</strong>
          </a>
          
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <MenuNotificaciones />
            </li>
            
            <li className="nav-item dropdown">
              <Dropdown>
                <Dropdown.Toggle variant="transparent" id="user-dropdown" className="nav-link">
                  <FaUserCircle className="icon" />
                  <span className="d-none d-md-inline-block ms-1">
                    {getDisplayName()}
                  </span>
                </Dropdown.Toggle>
                
                <Dropdown.Menu className="dropdown-menu-end">
                  <Dropdown.Item as={Link} to="/profile">
                    <FaUserCircle className="me-2" /> Mi Perfil
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item href="#!" onClick={handleLogoutClick}>
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
            <FaMoneyBillWave className="icon" /> Ventas
          </Link>
          <Link 
            to="/profile" 
            className={`header-button ${currentPath === '/profile' ? 'active' : ''}`}
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

      {/* Modal de confirmación de cierre de sesión */}
      <Modal show={showLogoutModal} onHide={handleCancelLogout} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaSignOutAlt className="me-2 text-warning" />
            Confirmar Cierre de Sesión
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">¿Estás seguro de que deseas cerrar sesión?</p>
          <small className="text-muted">
            Serás redirigido a la página de inicio de sesión.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelLogout}>
            Cancelar
          </Button>
          <Button variant="warning" onClick={handleConfirmLogout}>
            <FaSignOutAlt className="me-1" />
            Cerrar Sesión
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LayoutBarButton;