import { useState, useEffect, useCallback } from 'react';
import { Card, Container, Row, Col, Badge } from 'react-bootstrap';
import { 
  FaUserCircle, 
  FaPhone, FaMapMarkerAlt, FaEnvelope,
  FaUser, FaClock, FaUserShield, FaIdCard,
  FaCalendarAlt, FaEdit
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';

const AdminProfile = () => {
  // Estados principales
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  const processMySQLResponse = useCallback((rawData) => {
      try {
        if (!rawData) return [];
        
        if (Array.isArray(rawData)) {
          // Si es un array de arrays (resultado directo de MySQL)
          if (rawData.length > 0 && Array.isArray(rawData[0])) {
            return rawData[0].filter(item => item?.id_usuario);
          }
          // Si es un array simple de objetos cliente
          return rawData.filter(item => item?.id_usuario);
        }
        
        // Si es un solo objeto cliente
        if (rawData?.id_usuario) {
          return [rawData];
        }
        
        return [];
      } catch (error) {
        console.error('Error processing MySQL response:', error);
        return [];
      }
    }, []);

  // Función para obtener el token de autenticación
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
      
      const response = await fetch(`http://localhost:3001/api/users`, {
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
      setAdminData(data);
      
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      setError(`Error al cargar el perfil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  // Efecto para cargar el perfil al montar el componente
  useEffect(() => {
    fetchAdminProfile();
  }, [fetchAdminProfile]);

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para obtener las iniciales del nombre
  const getInitials = (nombre, apellido) => {
    const n = nombre ? nombre.charAt(0).toUpperCase() : '';
    const a = apellido ? apellido.charAt(0).toUpperCase() : '';
    return n + a;
  };

  return (
    <LayoutBarButton userData={userData}>
      <Container fluid className="py-4">
        {/* Header con gradiente */}
        <div 
          className="position-relative mb-5 rounded-3 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,rgb(255, 143, 7) 0%,rgb(230, 134, 17) 100%)',
            minHeight: '200px'
          }}
        >
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
            <div className="text-center text-white">
              <h1 className="display-5 fw-bold mb-2">Mi Perfil</h1>
              <p className="lead mb-0">Panel de Administrador</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger rounded-3 mb-4" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning mb-3" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando información del perfil...</p>
          </div>
        ) : adminData ? (
          <Row className="justify-content-center">
            <Col xxl={10}>
              {/* Tarjeta principal del perfil */}
              <Card className="shadow-lg border-0 rounded-4 mb-4" style={{ marginTop: '-80px' }}>
                <Card.Body className="p-0">
                  {/* Header del perfil con avatar */}
                  <div className="bg-light rounded-top-4 p-4 pb-0">
                    <div className="text-center position-relative">
                      {/* Avatar principal */}
                      <div 
                        className="rounded-circle border border-4 border-white shadow-lg mx-auto mb-3 d-flex align-items-center justify-content-center position-relative"
                        style={{ 
                          width: '140px', 
                          height: '140px',
                          background: 'linear-gradient(135deg, #ffc107 0%, #ff8c00 100%)',
                          marginTop: '-70px'
                        }}
                      >
                        <span className="text-white fw-bold" style={{ fontSize: '3rem' }}>
                          {getInitials(adminData.nombre_usuario, adminData.apellido_usuario)}
                        </span>
                      </div>
                      
                      {/* Información básica */}
                      <h2 className="fw-bold mb-2 text-dark">
                        {adminData.nombre_usuario} {adminData.apellido_usuario}
                      </h2>
                      
                      <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                        <Badge 
                          bg="warning" 
                          className="px-3 py-2 rounded-pill text-dark fw-semibold"
                          style={{ fontSize: '0.9rem' }}
                        >
                          <FaUserShield className="me-2" />
                          Administrador
                        </Badge>
                        <Badge 
                          bg="success" 
                          className="px-3 py-2 rounded-pill fw-semibold"
                          style={{ fontSize: '0.9rem' }}
                        >
                          Activo
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Información detallada */}
                  <div className="p-4">
                    <Row className="g-4">
                      {/* Información personal */}
                      <Col lg={6}>
                        <div className="h-100">
                          <div className="d-flex align-items-center mb-3">
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                background: 'linear-gradient(135deg, #ffc107 0%, #ff8c00 100%)' 
                              }}
                            >
                              <FaUser className="text-white" />
                            </div>
                            <h4 className="mb-0 text-dark">Información Personal</h4>
                          </div>
                          
                          <div className="ps-5">
                            <div className="mb-4">
                              <div className="d-flex align-items-center mb-2">
                                <FaIdCard className="text-warning me-2" />
                                <small className="text-muted text-uppercase fw-semibold">ID de Usuario</small>
                              </div>
                              <p className="fs-5 mb-0 text-dark fw-semibold">#{adminData.id_usuario}</p>
                            </div>

                            <div className="mb-4">
                              <div className="d-flex align-items-center mb-2">
                                <FaUser className="text-warning me-2" />
                                <small className="text-muted text-uppercase fw-semibold">Nombre Completo</small>
                              </div>
                              <p className="fs-5 mb-0 text-dark">
                                {adminData.nombre_usuario} {adminData.apellido_usuario}
                              </p>
                            </div>

                            <div className="mb-4">
                              <div className="d-flex align-items-center mb-2">
                                <FaEnvelope className="text-warning me-2" />
                                <small className="text-muted text-uppercase fw-semibold">Correo Electrónico</small>
                              </div>
                              <p className="fs-5 mb-0 text-dark">
                                {adminData.correo_usuario || 'No especificado'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Col>

                      {/* Información de cuenta */}
                      <Col lg={6}>
                        <div className="h-100">
                          <div className="d-flex align-items-center mb-3">
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' 
                              }}
                            >
                              <FaClock className="text-white" />
                            </div>
                            <h4 className="mb-0 text-dark">Información de Cuenta</h4>
                          </div>
                          
                          <div className="ps-5">
                            <div className="mb-4">
                              <div className="d-flex align-items-center mb-2">
                                <FaCalendarAlt className="text-info me-2" />
                                <small className="text-muted text-uppercase fw-semibold">Fecha de Registro</small>
                              </div>
                              <p className="fs-6 mb-0 text-dark">
                                {formatDate(adminData.fecha_creacion)}
                              </p>
                            </div>

                            <div className="mb-4">
                              <div className="d-flex align-items-center mb-2">
                                <FaEdit className="text-info me-2" />
                                <small className="text-muted text-uppercase fw-semibold">Última Actualización</small>
                              </div>
                              <p className="fs-6 mb-0 text-dark">
                                {formatDate(adminData.fecha_actualizacion)}
                              </p>
                            </div>

                            <div className="mb-4">
                              <div className="d-flex align-items-center mb-2">
                                <FaUserShield className="text-info me-2" />
                                <small className="text-muted text-uppercase fw-semibold">Rol del Usuario</small>
                              </div>
                              <p className="fs-6 mb-0">
                                <Badge bg="warning" className="text-dark">
                                  Administrador del Sistema
                                </Badge>
                              </p>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Card.Body>
              </Card>

              {/* Tarjetas de estadísticas adicionales */}
              <Row className="g-4">
                <Col md={4}>
                  <Card className="border-0 shadow-sm h-100 text-center rounded-3">
                    <Card.Body className="p-4">
                      <div 
                        className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' 
                        }}
                      >
                        <FaUserShield className="text-white" size={24} />
                      </div>
                      <h5 className="text-dark mb-2">Privilegios</h5>
                      <p className="text-muted mb-0">Acceso completo al sistema</p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="border-0 shadow-sm h-100 text-center rounded-3">
                    <Card.Body className="p-4">
                      <div 
                        className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          background: 'linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%)' 
                        }}
                      >
                        <FaClock className="text-white" size={24} />
                      </div>
                      <h5 className="text-dark mb-2">Estado</h5>
                      <p className="text-muted mb-0">Sesión activa</p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="border-0 shadow-sm h-100 text-center rounded-3">
                    <Card.Body className="p-4">
                      <div 
                        className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)' 
                        }}
                      >
                        <FaIdCard className="text-white" size={24} />
                      </div>
                      <h5 className="text-dark mb-2">Identificación</h5>
                      <p className="text-muted mb-0">ID #{adminData.id_usuario}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        ) : (
          <div className="text-center py-5">
            <div className="mb-4">
              <FaUserCircle className="text-muted" size={80} />
            </div>
            <h4 className="text-muted mb-2">No se encontraron datos del perfil</h4>
            <p className="text-muted">No pudimos cargar la información de tu perfil.</p>
          </div>
        )}
      </Container>
    </LayoutBarButton>
  );
};

export default AdminProfile;