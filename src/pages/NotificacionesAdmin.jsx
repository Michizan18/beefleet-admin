import { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Dropdown, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaSearch, FaBell, FaMapMarkerAlt, FaTrash, FaCheckCircle, FaImage, FaExclamationTriangle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import LayoutBarButton from '../components/LayoutBarButton';
import './NotificacionesAdmin.css';

const NotificacionesAdmin = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [filteredNotificaciones, setFilteredNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null);
  const [userData, setUserData] = useState(null);

  // Obtener datos del usuario y notificaciones
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulación de llamada API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Datos de usuario simulados
        const userData = {
          adminName: "Carlos Rodríguez",
        };
        
        // Datos simulados de notificaciones
        const notificacionesData = [
          {
            id: 1,
            conductor: "Luis Martínez",
            vehiculo: "ABC-123",
            tipo: "Problema con el vehículo",
            descripcion: "Llanta desinflada en la ruta hacia Medellín",
            fecha: "2025-05-20T10:30:00",
            estado: "Pendiente",
            ubicacion: "Carretera 45, Km 80, Medellín",
            imagenes: ["imagen1.jpg"],
            etapa: "Viajando",
            prioridad: "Alta"
          },
          {
            id: 2,
            conductor: "Pablo Cárdenas",
            vehiculo: "XYZ-789",
            tipo: "Carga exitosa",
            descripcion: "Carga entregada en la terminal de Cali",
            fecha: "2025-05-20T08:15:00",
            estado: "Recibido",
            ubicacion: "Terminal de Carga, Cali",
            imagenes: [],
            etapa: "Descarga completa",
            prioridad: "Baja"
          },
          {
            id: 3,
            conductor: "Mario López",
            vehiculo: "DEF-456",
            tipo: "Problema con la carga",
            descripcion: "Error con carga asignada. Mercancía no coincide con la orden",
            fecha: "2025-05-19T14:45:00",
            estado: "Resuelto",
            ubicacion: "Bodega Central, Bogotá",
            imagenes: ["imagen2.jpg", "imagen3.jpg"],
            etapa: "Descargando",
            prioridad: "Alta"
          },
          {
            id: 4,
            conductor: "Juan González",
            vehiculo: "GHI-123",
            tipo: "Emergencia",
            descripcion: "Accidente en la vía. Choque leve con otro vehículo",
            fecha: "2025-05-18T16:20:00",
            estado: "En proceso",
            ubicacion: "Autopista Sur, Km 15, Bogotá",
            imagenes: ["imagen4.jpg"],
            etapa: "Viajando",
            prioridad: "Crítica"
          },
          {
            id: 5,
            conductor: "Roberto Sánchez",
            vehiculo: "JKL-789",
            tipo: "Otro",
            descripcion: "Control policía en la vía, revisión de documentos",
            fecha: "2025-05-17T11:10:00",
            estado: "Resuelto",
            ubicacion: "Peaje Los Patios, Norte de Santander",
            imagenes: [],
            etapa: "Viajando",
            prioridad: "Baja"
          }
        ];
        
        setUserData(userData);
        setNotificaciones(notificacionesData);
        setFilteredNotificaciones(notificacionesData);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Detectar ID de notificación en la URL
    const params = new URLSearchParams(window.location.search);
    const notifId = params.get('id');
    
    if (notifId && !loading) {
      // Buscar la notificación con ese ID
      const notificacion = notificaciones.find(n => n.id === parseInt(notifId));
      if (notificacion) {
        // Mostrar detalles de esa notificación
        setNotificacionSeleccionada(notificacion);
        setShowModal(true);
      }
    }
  }, [notificaciones, loading]);

  // Filtrar notificaciones según términos de búsqueda y filtros
  useEffect(() => {
    let filtered = [...notificaciones];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(notif => 
        notif.conductor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.vehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por tipo
    if (filtroTipo !== 'Todos') {
      filtered = filtered.filter(notif => notif.tipo === filtroTipo);
    }
    
    // Filtrar por estado
    if (filtroEstado !== 'Todos') {
      filtered = filtered.filter(notif => notif.estado === filtroEstado);
    }
    
    setFilteredNotificaciones(filtered);
  }, [searchTerm, filtroTipo, filtroEstado, notificaciones]);

  // Formatear fecha
  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const diferenciaMs = ahora - fecha;
    const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
    
    if (diferenciaMinutos < 60) {
      return `Hace ${diferenciaMinutos} minutos`;
    } else if (diferenciaMinutos < 24 * 60) {
      const horas = Math.floor(diferenciaMinutos / 60);
      return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    } else {
      return fecha.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Manejar cambio de estado de notificación
  const cambiarEstadoNotificacion = (id, nuevoEstado) => {
    const actualizadas = notificaciones.map(notif => 
      notif.id === id ? { ...notif, estado: nuevoEstado } : notif
    );
    setNotificaciones(actualizadas);
  };

  // Eliminar notificación
  const eliminarNotificacion = (id) => {
    setNotificaciones(notificaciones.filter(notif => notif.id !== id));
  };

  // Ver detalles de notificación
  const verDetalles = (notificacion) => {
    setNotificacionSeleccionada(notificacion);
    setShowModal(true);
  };

  // Obtener color de badge según prioridad
  const getBadgeColor = (prioridad) => {
    switch (prioridad.toLowerCase()) {
      case 'crítica': return 'danger';
      case 'alta': return 'warning';
      case 'media': return 'primary';
      case 'baja': return 'success';
      default: return 'secondary';
    }
  };

  // Obtener color de badge según estado
  const getEstadoBadgeColor = (estado) => {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'danger';
      case 'recibido': return 'primary';
      case 'en proceso': return 'warning';
      case 'resuelto': return 'success';
      default: return 'secondary';
    }
  };

  // Obtener icono según tipo de notificación
  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'Problema con el vehículo': return <FaExclamationTriangle className="text-warning" />;
      case 'Retraso en la entrega': return <FaBell className="text-primary" />;
      case 'Problema con la carga': return <FaBell className="text-warning" />;
      case 'Carga exitosa': return <FaBell className="text-success" />;
      case 'Descarga exitosa': return <FaBell className="text-success" />;
      case 'Emergencia': return <FaExclamationTriangle className="text-danger" />;
      default: return <FaBell className="text-secondary" />;
    }
  };

  return (
    <LayoutBarButton userData={userData}>
      <div className="notificaciones-admin-container">
        <h1 className="mt-4 mb-4">Notificaciones de Conductores</h1>
        
        {/* Filtros y búsqueda */}
        <Row className="mb-4 align-items-center">
          <Col lg={4} md={6} className="mb-3 mb-md-0">
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Buscar por conductor, vehículo o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          
          <Col lg={8} md={6} className="d-flex justify-content-md-end">
            <Dropdown className="me-2">
              <Dropdown.Toggle variant="outline-secondary">
                Tipo: {filtroTipo}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFiltroTipo('Todos')}>Todos</Dropdown.Item>
                <Dropdown.Item onClick={() => setFiltroTipo('Problema con el vehículo')}>Problema con el vehículo</Dropdown.Item>
                <Dropdown.Item onClick={() => setFiltroTipo('Retraso en la entrega')}>Retraso en la entrega</Dropdown.Item>
                <Dropdown.Item onClick={() => setFiltroTipo('Problema con la carga')}>Problema con la carga</Dropdown.Item>
                <Dropdown.Item onClick={() => setFiltroTipo('Emergencia')}>Emergencia</Dropdown.Item>
                <Dropdown.Item onClick={() => setFiltroTipo('Carga exitosa')}>Carga exitosa</Dropdown.Item>
                <Dropdown.Item onClick={() => setFiltroTipo('Descarga exitosa')}>Descarga exitosa</Dropdown.Item>
                <Dropdown.Item onClick={() => setFiltroTipo('Otro')}>Otro</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary">
                Estado: {filtroEstado}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFiltroEstado('Todos')}>Todos</Dropdown.Item>
                <Dropdown.Item onClick={() => setFiltroEstado('Pendiente')}>Pendiente</Dropdown.Item>
                <Dropdown.Item onClick={() => setFiltroEstado('Recibido')}>Recibido</Dropdown.Item>
                <Dropdown.Item onClick={() => setFiltroEstado('En proceso')}>En proceso</Dropdown.Item>
                <Dropdown.Item onClick={() => setFiltroEstado('Resuelto')}>Resuelto</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
        
        {/* Lista de notificaciones */}
        <div className="notificaciones-list">
          {filteredNotificaciones.length === 0 ? (
            <div className="text-center py-5">
              <FaBell size={40} className="text-muted mb-3" />
              <h5>No hay notificaciones que coincidan con los filtros</h5>
            </div>
          ) : (
            filteredNotificaciones.map(notificacion => (
              <Card key={notificacion.id} className="notificacion-card mb-3">
                <Card.Body>
                  <Row>
                    <Col xs={12} md={8}>
                      <div className="d-flex align-items-center mb-2">
                        <div className="tipo-icon me-2">
                          {getTipoIcon(notificacion.tipo)}
                        </div>
                        <div>
                          <h5 className="mb-0">{notificacion.tipo}</h5>
                          <div className="text-muted small">{formatearFecha(notificacion.fecha)}</div>
                        </div>
                      </div>
                      
                      <p className="notificacion-descripcion mb-2">{notificacion.descripcion}</p>
                      
                      <div className="d-flex flex-wrap mb-2">
                        <div className="me-3 mb-1">
                          <span className="fw-bold">Conductor:</span> {notificacion.conductor}
                        </div>
                        <div className="me-3 mb-1">
                          <span className="fw-bold">Vehículo:</span> {notificacion.vehiculo}
                        </div>
                        <div className="me-3 mb-1">
                          <span className="fw-bold">Etapa:</span> {notificacion.etapa}
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <FaMapMarkerAlt className="text-danger me-1" /> {notificacion.ubicacion}
                      </div>
                      
                      <div className="d-flex flex-wrap">
                        <Badge bg={getBadgeColor(notificacion.prioridad)} className="me-2 mb-1">
                          Prioridad: {notificacion.prioridad}
                        </Badge>
                        <Badge bg={getEstadoBadgeColor(notificacion.estado)} className="me-2 mb-1">
                          {notificacion.estado}
                        </Badge>
                        {notificacion.imagenes.length > 0 && (
                          <Badge bg="info" className="me-2 mb-1">
                            <FaImage className="me-1" /> {notificacion.imagenes.length} {notificacion.imagenes.length === 1 ? 'imagen' : 'imágenes'}
                          </Badge>
                        )}
                      </div>
                    </Col>
                    
                    <Col xs={12} md={4} className="d-flex flex-column align-items-md-end justify-content-center mt-3 mt-md-0">
                      <div className="d-flex flex-wrap justify-content-md-end">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2 mb-2"
                          onClick={() => verDetalles(notificacion)}
                        >
                          Ver detalles
                        </Button>
                        
                        <Dropdown className="me-2 mb-2">
                          <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-${notificacion.id}`}>
                            Cambiar estado
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => cambiarEstadoNotificacion(notificacion.id, 'Pendiente')}>Pendiente</Dropdown.Item>
                            <Dropdown.Item onClick={() => cambiarEstadoNotificacion(notificacion.id, 'Recibido')}>Recibido</Dropdown.Item>
                            <Dropdown.Item onClick={() => cambiarEstadoNotificacion(notificacion.id, 'En proceso')}>En proceso</Dropdown.Item>
                            <Dropdown.Item onClick={() => cambiarEstadoNotificacion(notificacion.id, 'Resuelto')}>Resuelto</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                        
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="mb-2"
                          onClick={() => eliminarNotificacion(notificacion.id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {/* Modal de detalles */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la notificación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {notificacionSeleccionada && (
            <div>
              <h5 className="d-flex align-items-center">
                {getTipoIcon(notificacionSeleccionada.tipo)}
                <span className="ms-2">{notificacionSeleccionada.tipo}</span>
                <Badge bg={getBadgeColor(notificacionSeleccionada.prioridad)} className="ms-3">
                  Prioridad: {notificacionSeleccionada.prioridad}
                </Badge>
              </h5>
              
              <p className="text-muted">
                {formatearFecha(notificacionSeleccionada.fecha)}
              </p>
              
              <h6>Descripción:</h6>
              <p>{notificacionSeleccionada.descripcion}</p>
              
              <Row className="mb-3">
                <Col md={4}>
                  <h6>Conductor:</h6>
                  <p>{notificacionSeleccionada.conductor}</p>
                </Col>
                <Col md={4}>
                  <h6>Vehículo:</h6>
                  <p>{notificacionSeleccionada.vehiculo}</p>
                </Col>
                <Col md={4}>
                  <h6>Etapa:</h6>
                  <p>{notificacionSeleccionada.etapa}</p>
                </Col>
              </Row>
              
              <h6>Ubicación:</h6>
              <p><FaMapMarkerAlt className="text-danger me-1" /> {notificacionSeleccionada.ubicacion}</p>
              
              <h6>Estado:</h6>
              <div className="mb-3">
                <Badge bg={getEstadoBadgeColor(notificacionSeleccionada.estado)} style={{ fontSize: '1rem', padding: '8px 12px' }}>
                  {notificacionSeleccionada.estado}
                </Badge>
              </div>
              
              <h6>Imágenes adjuntas:</h6>
              {notificacionSeleccionada.imagenes.length === 0 ? (
                <p>No hay imágenes adjuntas</p>
              ) : (
                <Row>
                  {notificacionSeleccionada.imagenes.map((imagen, index) => (
                    <Col key={index} xs={6} md={4} className="mb-3">
                      <div className="imagen-placeholder d-flex justify-content-center align-items-center bg-light rounded" style={{ height: '120px' }}>
                        <FaImage size={30} className="text-secondary" />
                      </div>
                      <div className="text-center mt-1 small">{imagen}</div>
                    </Col>
                  ))}
                </Row>
              )}
              
              <h6>Historial de acciones:</h6>
              <ul className="list-unstyled">
                <li className="mb-1">• Creado el {new Date(notificacionSeleccionada.fecha).toLocaleDateString('es-ES')}</li>
                {notificacionSeleccionada.estado !== 'Pendiente' && (
                  <li className="mb-1">• Marcado como {notificacionSeleccionada.estado.toLowerCase()} el {new Date().toLocaleDateString('es-ES')}</li>
                )}
              </ul>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {notificacionSeleccionada?.estado !== 'Resuelto' && (
            <Button 
              variant="success" 
              onClick={() => {
                cambiarEstadoNotificacion(notificacionSeleccionada.id, 'Resuelto');
                setShowModal(false);
              }}
            >
              <FaCheckCircle className="me-1" /> Marcar como resuelto
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </LayoutBarButton>
  );
};

export default NotificacionesAdmin;