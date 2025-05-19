import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup, Badge, Pagination, Modal, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaClipboardList, FaChartLine, FaBell, 
  FaCalendarAlt, FaUserCircle, FaSignOutAlt, FaCog,
  FaSearch, FaPlus, FaFilter, FaTruck, FaEdit,
  FaTrashAlt, FaMapMarkedAlt, FaMapMarkerAlt, FaArrowRight, 
  FaRulerHorizontal, FaBoxOpen, FaInfoCircle, FaSave
} from 'react-icons/fa';
import './Rutas.css';

const Rutas = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rutas, setRutas] = useState([]);
  const [filteredRutas, setFilteredRutas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentRuta, setCurrentRuta] = useState(null);
  const [filterDestino, setFilterDestino] = useState('todos');
  const [destinosUnicos, setDestinosUnicos] = useState([]);
  
  // Estado para nueva ruta
  const [nuevaRuta, setNuevaRuta] = useState({
    origen: '',
    destino: '',
    distancia: '',
    carga: '',
    tiempo_estimado: '',
    estado: 'Disponible'
  });
  
  const rutasPorPagina = 8;

  useEffect(() => {
    // Simulación de carga de datos
    const fetchUserData = async () => {
      setLoading(true);
      
      try {
        // Simulación de llamada API
        const response = await fetch('http://localhost:3001/api/states', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if(!response.ok) {
          throw new Error('Error en la respuesta de la API');
        }

        // Datos simulados del usuario
        const data = {
          adminName: "Carlos Rodríguez",
          notificaciones: [
            { id: 1, texto: "Nueva ruta asignada", tiempo: "Hace 30 min", tipo: "info" },
            { id: 2, texto: "Retraso en ruta Cali-Bogotá", tiempo: "Hace 2 horas", tipo: "warning" },
            { id: 3, texto: "Actualización de sistema", tiempo: "Ayer", tipo: "info" }
          ]
        };
        
        setUserData(data);
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchRutas = async () => {
      try {
        // Simulación de llamada API
        // En un caso real, aquí harías una llamada fetch a tu backend
        
        // Datos simulados de rutas
        const rutasData = [
          { 
            id: 1, 
            origen: "Bogotá", 
            destino: "Medellín", 
            distancia: 415, 
            carga: "Productos alimenticios", 
            tiempo_estimado: "8 horas",
            fecha_creacion: "2025-04-12",
            estado: "En progreso",
            conductor_asignado: "Juan Pérez",
            vehiculo: "ABC-123"
          },
          { 
            id: 2, 
            origen: "Cali", 
            destino: "Barranquilla", 
            distancia: 1083, 
            carga: "Maquinaria pesada", 
            tiempo_estimado: "24 horas",
            fecha_creacion: "2025-04-10",
            estado: "Disponible",
            conductor_asignado: "",
            vehiculo: ""
          },
          { 
            id: 3, 
            origen: "Medellín", 
            destino: "Cúcuta", 
            distancia: 581, 
            carga: "Textiles", 
            tiempo_estimado: "12 horas",
            fecha_creacion: "2025-04-15",
            estado: "Completada",
            conductor_asignado: "María López",
            vehiculo: "XYZ-789"
          },
          { 
            id: 4, 
            origen: "Cartagena", 
            destino: "Bogotá", 
            distancia: 1030, 
            carga: "Material de construcción", 
            tiempo_estimado: "20 horas",
            fecha_creacion: "2025-04-14",
            estado: "En progreso",
            conductor_asignado: "Pedro Gómez",
            vehiculo: "DEF-456"
          },
          { 
            id: 5, 
            origen: "Cali", 
            destino: "Medellín", 
            distancia: 429, 
            carga: "Electrodomésticos", 
            tiempo_estimado: "9 horas",
            fecha_creacion: "2025-04-11",
            estado: "Disponible",
            conductor_asignado: "",
            vehiculo: ""
          },
          { 
            id: 6, 
            origen: "Bucaramanga", 
            destino: "Cali", 
            distancia: 748, 
            carga: "Productos químicos", 
            tiempo_estimado: "15 horas",
            fecha_creacion: "2025-04-09",
            estado: "Completada",
            conductor_asignado: "Ana Martinez",
            vehiculo: "GHI-789"
          },
          { 
            id: 7, 
            origen: "Pereira", 
            destino: "Barranquilla", 
            distancia: 892, 
            carga: "Productos farmacéuticos", 
            tiempo_estimado: "18 horas",
            fecha_creacion: "2025-04-13",
            estado: "Disponible",
            conductor_asignado: "",
            vehiculo: ""
          },
          { 
            id: 8, 
            origen: "Medellín", 
            destino: "Cartagena", 
            distancia: 637, 
            carga: "Frutas y verduras", 
            tiempo_estimado: "13 horas",
            fecha_creacion: "2025-04-12",
            estado: "En progreso",
            conductor_asignado: "Luis Ramírez",
            vehiculo: "JKL-012"
          },
          { 
            id: 9, 
            origen: "Bogotá", 
            destino: "Barranquilla", 
            distancia: 1004, 
            carga: "Materiales tecnológicos", 
            tiempo_estimado: "22 horas",
            fecha_creacion: "2025-04-15",
            estado: "Disponible",
            conductor_asignado: "",
            vehiculo: ""
          },
          { 
            id: 10, 
            origen: "Santa Marta", 
            destino: "Cali", 
            distancia: 1100, 
            carga: "Mobiliario", 
            tiempo_estimado: "23 horas",
            fecha_creacion: "2025-04-10",
            estado: "Completada",
            conductor_asignado: "Carlos Díaz",
            vehiculo: "MNO-345"
          }
        ];
        
        setRutas(rutasData);
        setFilteredRutas(rutasData);
        
        // Extraer destinos únicos para el filtro
        const destinos = [...new Set(rutasData.map(ruta => ruta.destino))];
        setDestinosUnicos(destinos);
        
      } catch (error) {
        console.error("Error al cargar datos de rutas:", error);
      }
    };
    
    fetchUserData();
    fetchRutas();
  }, []);
  
  useEffect(() => {
    // Filtrar rutas según búsqueda y destino
    let filtered = rutas;
    
    // Aplicar filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(ruta => 
        ruta.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruta.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruta.carga.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtro por destino
    if (filterDestino !== 'todos') {
      filtered = filtered.filter(ruta => ruta.destino === filterDestino);
    }
    
    setFilteredRutas(filtered);
    setCurrentPage(1); // Resetear a primera página al filtrar
  }, [searchTerm, filterDestino, rutas]);
  
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
  const indexOfLastRuta = currentPage * rutasPorPagina;
  const indexOfFirstRuta = indexOfLastRuta - rutasPorPagina;
  const currentRutas = filteredRutas.slice(indexOfFirstRuta, indexOfLastRuta);
  
  // Calcular total de páginas
  const totalPages = Math.ceil(filteredRutas.length / rutasPorPagina);
  
  // Mostrar detalles de ruta
  const handleShowDetails = (ruta) => {
    setCurrentRuta(ruta);
    setShowModal(true);
  };
  
  // Abrir modal para añadir nueva ruta
  const handleShowAddModal = () => {
    setShowAddModal(true);
  };
  
  // Manejar cambios en el formulario de nueva ruta
  const handleNuevaRutaChange = (e) => {
    const { name, value } = e.target;
    setNuevaRuta({
      ...nuevaRuta,
      [name]: value
    });
  };
  
  // Guardar nueva ruta
  const handleGuardarRuta = () => {
    // Validar campos requeridos
    if (!nuevaRuta.origen || !nuevaRuta.destino || !nuevaRuta.distancia || !nuevaRuta.carga) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }
    
    // En un caso real, aquí enviarías los datos al backend
    const nuevaRutaConId = {
      ...nuevaRuta,
      id: rutas.length + 1,
      fecha_creacion: new Date().toISOString().split('T')[0]
    };
    
    // Actualizar estado
    setRutas([...rutas, nuevaRutaConId]);
    
    // Resetear formulario y cerrar modal
    setNuevaRuta({
      origen: '',
      destino: '',
      distancia: '',
      carga: '',
      tiempo_estimado: '',
      estado: 'Disponible'
    });
    setShowAddModal(false);
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
      case 'Disponible':
        variant = 'success';
        break;
      case 'En progreso':
        variant = 'primary';
        break;
      case 'Completada':
        variant = 'info';
        break;
      case 'Cancelada':
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
            <li className="nav-item">
              <Link to="/conductores" className="nav-link">
                <FaUsers className="icon" /> Conductores
              </Link>
            </li>
            <li className="nav-item mt-3">
              <Link to="/rutas" className="nav-link active">
                <FaMapMarkedAlt className="icon" /> Rutas
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
              <h1 className="mt-4">Gestión de Rutas</h1>
              <p className="text-muted">Administra la información de las rutas de transporte y asigna conductores</p>
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary" 
                className="d-flex align-items-center"
                onClick={handleShowAddModal}
              >
                <FaPlus className="me-2" /> Nueva Ruta
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
                      placeholder="Buscar por origen, destino o tipo de carga"
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
                      value={filterDestino}
                      onChange={(e) => setFilterDestino(e.target.value)}
                    >
                      <option value="todos">Todos los destinos</option>
                      {destinosUnicos.map(destino => (
                        <option key={destino} value={destino}>{destino}</option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {/* Listado de rutas */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Listado de Rutas</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Origen</th>
                      <th>Destino</th>
                      <th>Distancia (km)</th>
                      <th>Carga</th>
                      <th>Estado</th>
                      <th>Fecha Creación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRutas.map(ruta => (
                      <tr key={ruta.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaMapMarkerAlt className="me-2 text-danger" />
                            {ruta.origen}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaMapMarkerAlt className="me-2 text-success" />
                            {ruta.destino}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaRulerHorizontal className="me-2 text-secondary" />
                            {ruta.distancia} km
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaBoxOpen className="me-2 text-warning" />
                            {ruta.carga}
                          </div>
                        </td>
                        <td>
                          <EstadoBadge estado={ruta.estado} />
                        </td>
                        <td>{formatDate(ruta.fecha_creacion)}</td>
                        <td>
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleShowDetails(ruta)}
                          >
                            <FaInfoCircle />
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
              
              {filteredRutas.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted">No se encontraron rutas con los criterios de búsqueda.</p>
                </div>
              )}
              
              {/* Paginación */}
              {renderPagination()}
            </Card.Body>
          </Card>
        </Container>
      </main>
      
      {/* Modal de detalles de la ruta */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Ruta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentRuta && (
            <div className="ruta-detail">
              <Row>
                <Col md={12} className="mb-4">
                  <Card className="route-card">
                    <Card.Body>
                      <div className="route-line">
                        <div className="route-point origin">
                          <FaMapMarkerAlt className="text-danger" size={24} />
                          <h4>{currentRuta.origen}</h4>
                        </div>
                        <div className="route-arrow">
                          <FaArrowRight className="text-primary" size={20} />
                          <div className="route-info">
                            <span>{currentRuta.distancia} km</span>
                            <span className="text-muted">({currentRuta.tiempo_estimado})</span>
                          </div>
                        </div>
                        <div className="route-point destination">
                          <FaMapMarkerAlt className="text-success" size={24} />
                          <h4>{currentRuta.destino}</h4>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <EstadoBadge estado={currentRuta.estado} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <h5 className="mb-3">Información de la Ruta</h5>
                  <Table bordered>
                    <tbody>
                      <tr>
                        <td><strong>Fecha de Creación</strong></td>
                        <td>{formatDate(currentRuta.fecha_creacion)}</td>
                      </tr>
                      <tr>
                        <td><strong>Distancia</strong></td>
                        <td>{currentRuta.distancia} km</td>
                      </tr>
                      <tr>
                        <td><strong>Tiempo Estimado</strong></td>
                        <td>{currentRuta.tiempo_estimado}</td>
                      </tr>
                      <tr>
                        <td><strong>Tipo de Carga</strong></td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaBoxOpen className="me-2 text-warning" />
                            {currentRuta.carga}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5 className="mb-3">Asignación</h5>
                  {currentRuta.conductor_asignado ? (
                    <Table bordered>
                      <tbody>
                        <tr>
                          <td><strong>Conductor</strong></td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaUserCircle className="me-2 text-primary" />
                              {currentRuta.conductor_asignado}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Vehículo</strong></td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaTruck className="me-2 text-secondary" />
                              {currentRuta.vehiculo}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center p-4 bg-light rounded">
                      <p className="mb-2 text-muted">No hay conductor asignado a esta ruta</p>
                      <Button variant="outline-primary" size="sm">
                        Asignar Conductor
                      </Button>
                    </div>
                  )}
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
      
      {/* Modal para agregar nueva ruta */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nueva Ruta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Origen *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaMapMarkerAlt className="text-danger" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="origen"
                      value={nuevaRuta.origen}
                      onChange={handleNuevaRutaChange}
                      placeholder="Duración estimada (ej. 8 horas)"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Carga *</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaBoxOpen />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  name="carga"
                  value={nuevaRuta.carga}
                  onChange={handleNuevaRutaChange}
                  placeholder="Descripción de la carga"
                  required
                />
              </InputGroup>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="estado"
                value={nuevaRuta.estado}
                onChange={handleNuevaRutaChange}
              >
                <option value="Disponible">Disponible</option>
                <option value="En progreso">En progreso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </Form.Select>
            </Form.Group>
            
            <p className="text-muted mt-2">* Campos obligatorios</p>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardarRuta}>
            <FaSave className="me-2" /> Guardar Ruta
          </Button>
        </Modal.Footer>
      </Modal>
      

    </div>
  );
};

export default Rutas;