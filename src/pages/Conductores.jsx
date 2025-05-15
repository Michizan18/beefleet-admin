import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup, Badge, Pagination, Modal, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaClipboardList, FaChartLine, FaBell, 
  FaCalendarAlt, FaUserCircle, FaSignOutAlt, FaCog,
  FaSearch, FaUserPlus, FaFilter, FaCarAlt, FaEdit,
  FaTrashAlt, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt
} from 'react-icons/fa';
import './Dashboard.css';

const Conductores = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conductores, setConductores] = useState([]);
  const [filteredConductores, setFilteredConductores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  
  const conductoresPorPagina = 8;

  useEffect(() => {
    const fetchConductores = async () => {
      try {
        // Simulación de llamada API
        const response = await fetch('http://localhost:3001/api/drivers',{
          method: 'GET',
          headers:{
            'Content-Type': 'application/json',
          },
        });

        const driverData = await response.json();
        console.log(driverData[0]);
        
        setConductores(driverData[0]);
        setFilteredConductores(driverData[0]);
      } catch (error) {
        console.error("Error al cargar datos de conductores:", error);
      } finally{
        setLoading(false);
      }
    };
    
    // fetchUserData();
    fetchConductores();
  }, []);
  
  useEffect(() => {
    // Filtrar conductores según búsqueda y estado
    let filtered = conductores;
    
    // Aplicar filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(conductor => 
        conductor.nombre_coductor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conductor.cedula.includes(searchTerm) ||
        conductor.vehiculoAsignado.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtro por estado
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(conductor => conductor.estado === filterStatus);
    }
    
    setFilteredConductores(filtered);
    setCurrentPage(1); // Resetear a primera página al filtrar
  }, [searchTerm, filterStatus, conductores]);
  
  // Formatear fecha a formato español
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Gestionar el cambio de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Calcular índices para paginación
  const indexOfLastConductor = currentPage * conductoresPorPagina;
  const indexOfFirstConductor = indexOfLastConductor - conductoresPorPagina;
  const currentConductores = filteredConductores.slice(indexOfFirstConductor, indexOfLastConductor);
  
  // Calcular total de páginas
  const totalPages = Math.ceil(filteredConductores.length / conductoresPorPagina);
  
  // Mostrar detalles de conductor
  const handleShowDetails = (driver) => {
    setCurrentDriver(driver);
    setShowModal(true);
  };
  
  // Componente de Paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageItems = [];
    for (let number = 1; number <= totalPages; number++) {
      pageItems.push(
        <Pagination.Item 
          key={number} 
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    
    return (
      <Pagination className="justify-content-center mt-3">
        <Pagination.Prev 
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        />
        {pageItems}
        <Pagination.Next 
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };
  
  // Componente para el badge de estado
  const EstadoBadge = ({ estado }) => {
    let variant;
    switch (estado) {
      case 'Activo':
        variant = 'success';
        break;
      case 'En ruta':
        variant = 'primary';
        break;
      case 'Descanso':
        variant = 'warning';
        break;
      case 'Inactivo':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    
    return <Badge bg={variant}>{estado}</Badge>;
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando datos...</p>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      {/* Barra de navegación superior */}
      <nav className="navbar navbar-expand navbar-dark bg-primary fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="#!">
            <strong>Sistema de Gestión</strong>
          </a>
          
          <ul className="navbar-nav ms-auto">
            <li className="nav-item dropdown">
              <Dropdown>
                <Dropdown.Toggle variant="transparent" id="notification-dropdown" className="nav-link">
                  <FaBell className="icon" />
                  <span className="badge rounded-pill bg-danger">
                    {userData?.notificaciones.length || 0}
                  </span>
                </Dropdown.Toggle>
                
                <Dropdown.Menu className="dropdown-menu-end notification-dropdown">
                  <h6 className="dropdown-header">Notificaciones</h6>
                  {userData?.notificaciones.map(notif => (
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
      
      {/* Menú lateral */}
      <div className="sidebar">
        <div className="sidebar-sticky">
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">
                <FaChartLine className="icon" /> Dashboard
              </Link>
            </li>
            <li className="nav-item mt-3">
              <Link to="/conductores" className="nav-link active">
                <FaUsers className="icon" /> Conductores
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/proyectos" className="nav-link">
                <FaClipboardList className="icon" /> Proyectos
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/calendario" className="nav-link">
                <FaCalendarAlt className="icon" /> Calendario
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/profile" className="nav-link">
                <FaUserCircle className="icon" /> Mi Perfil
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Contenido principal */}
      <main className="content">
        <Container fluid>
          <Row className="align-items-center mb-4">
            <Col>
              <h1 className="mt-4">Gestión de Conductores</h1>
              <p className="text-muted">Administra la información de los conductores activos y su estado</p>
            </Col>
            <Col xs="auto">
              <Button variant="primary" className="d-flex align-items-center">
                <FaUserPlus className="me-2" /> Nuevo Conductor
              </Button>
            </Col>
          </Row>
          
          {/* Filtros y búsqueda */}
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={6} lg={8}>
                  <InputGroup>
                    <InputGroup.Text id="basic-addon1">
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Buscar por nombre, cédula o vehículo"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={6} lg={4} className="mt-3 mt-md-0">
                  <InputGroup>
                    <InputGroup.Text id="filter-addon">
                      <FaFilter />
                    </InputGroup.Text>
                    <Form.Select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="Activo">Activo</option>
                      <option value="En ruta">En ruta</option>
                      <option value="Descanso">Descanso</option>
                      <option value="Inactivo">Inactivo</option>
                    </Form.Select>
                  </InputGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {/* Listado de conductores */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Listado de Conductores</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Cédula</th>
                      <th>Vehículo</th>
                      <th>Ciudad</th>
                      <th>Estado</th>
                      <th>Calificación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentConductores.map(conductor => (
                      <tr key={conductor.id_conductor}>
                        <td>{conductor.nombre_conductor}</td>
                        <td>{conductor.documento}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaCarAlt className="me-2 text-secondary" />
                            {conductor.vehiculoAsignado}
                          </div>
                        </td>
                        <td>{conductor.ciudad}</td>
                        <td>
                          <EstadoBadge estado={conductor.estado} />
                        </td>
                        <td>
                          <div className="rating">
                            <span className="rating-value">{conductor.calificacion}</span>
                            <div className="rating-stars">
                              {[...Array(5)].map((_, i) => (
                                <span 
                                  key={i}
                                  className={`star ${i < Math.floor(conductor.calificacion) ? 'filled' : ''}`}
                                >★</span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td>
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleShowDetails(conductor)}
                          >
                            Ver
                          </Button>
                          <Button variant="outline-primary" size="sm" className="me-1">
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            <FaTrashAlt />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {filteredConductores.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted">No se encontraron conductores con los criterios de búsqueda.</p>
                </div>
              )}
              
              {/* Paginación */}
              {renderPagination()}
            </Card.Body>
          </Card>
        </Container>
      </main>
      
      {/* Modal de detalles del conductor */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Conductor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentDriver && (
            <div className="driver-detail">
              <Row>
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <div className="driver-avatar mb-3">
                    <FaUserCircle size={100} className="text-primary" />
                  </div>
                  <h4>{currentDriver.nombre_conductor}</h4>
                  <p className="mb-1">
                    <EstadoBadge estado={currentDriver.estado} />
                  </p>
                  <p className="text-muted">
                    <FaIdCard className="me-2" />
                    {currentDriver.documento}
                  </p>
                </Col>
                <Col md={8}>
                  <h5 className="mb-3">Información de Contacto</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Teléfono:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaPhone className="me-2 text-primary" />
                        {currentDriver.telefono}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Email:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaEnvelope className="me-2 text-primary" />
                        {currentDriver.correo_conductor}
                      </p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Ciudad:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaMapMarkerAlt className="me-2 text-primary" />
                        {currentDriver.ciudad}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Licencia:</strong></p>
                      <p className="d-flex align-items-center">
                        <Badge bg="secondary" className="me-2">
                          {currentDriver.tipo_licencia}
                        </Badge>
                      </p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Información Laboral</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Experiencia</strong></p>
                      <p>{formatDate(currentDriver.experiencia)}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Último Reporte:</strong></p>
                      <p>{formatDate(currentDriver.ultimoReporte)}</p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Vehículo</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Placa:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaCarAlt className="me-2 text-primary" />
                        {currentDriver.vehiculoAsignado}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Modelo:</strong></p>
                      <p>{currentDriver.modeloVehiculo}</p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Estadísticas</h5>
                  <Row>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Viajes Completados:</strong></p>
                      <h3 className="text-primary">{currentDriver.viajesCompletados}</h3>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Calificación:</strong></p>
                      <div className="rating">
                        <h3 className="text-primary">{currentDriver.calificacion}</h3>
                        <div className="rating-stars large">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i}
                              className={`star ${i < Math.floor(currentDriver.calificacion) ? 'filled' : ''}`}
                            >★</span>
                          ))}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
          <Button variant="primary">
            <FaEdit className="me-2" /> Editar Información
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Conductores;