import { useState, useEffect } from 'react';
import { Card, Table, Button, Dropdown, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard, 
  FaUserPlus, FaUserCircle, FaSearch, FaFilter, FaCarAlt, 
  FaEdit, FaTrashAlt, FaPlus, FaSave 
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import './Conductores.css';
import { apiRequest } from '../utils/api';

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
  const [isUpdating, setIsUpdating] = useState('');
  const [showNewDriverModal, setShowNewDriverModal] = useState(false);
  const [showUpdateDriverModal, setShowUpdateDrivermodal] = useState(false);
    
  // Estado para nuevo conductor
  const [newDriver, setNewDriver] = useState({
    tipo_documento: '',
    documento: '',
    nombre_conductor: '',
    apellido_conductor: '',
    correo_conductor: '',
    foto: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    tipo_licencia: '',
    fecha_vencimiento: '',
    experiencia: '',
    contraseña: '',
    estado: 'Activo',
  });

  // Estado para editar conductor
  const [editDriver, setEditDriver] = useState({
    id_conductor: '',
    tipo_documento: '',
    documento: '',
    nombre_conductor: '',
    apellido_conductor: '',
    correo_conductor: '',
    foto: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    tipo_licencia: '',
    fecha_vencimiento: '',
    experiencia: '',
  });

  const [validated, setValidated] = useState(false);
  
  const conductoresPorPagina = 8;

useEffect(() => {
  const fetchConductores = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No hay token disponible');
        return;
      }

      const response = await fetch('http://localhost:3001/api/drivers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Debug: ver qué devuelve el servidor
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const driverData = await response.json();
      setConductores(driverData);
      setFilteredConductores(driverData);
    } catch (error) {
      console.error("Error al cargar datos de conductores:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchConductores();
}, []);
  
  useEffect(() => {
    // Filtrar conductores según búsqueda y estado
    let filtered = conductores;
    
    // Aplicar filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(conductor => 
        conductor.nombre_conductor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conductor.documento?.includes(searchTerm)
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

  // Función para abrir modal de edición
  const handleEditDriver = (driver) => {
    setEditDriver({
      id_conductor: driver.id_conductor,
      tipo_documento: driver.tipo_documento || '',
      documento: driver.documento || '',
      nombre_conductor: driver.nombre_conductor || '',
      apellido_conductor: driver.apellido_conductor || '',
      correo_conductor: driver.correo_conductor || '',
      foto: driver.foto || '',
      telefono: driver.telefono || '',
      ciudad: driver.ciudad || '',
      direccion: driver.direccion || '',
      tipo_licencia: driver.tipo_licencia || '',
      fecha_vencimiento: driver.fecha_vencimiento ? driver.fecha_vencimiento.split('T')[0] : '',
      experiencia: driver.experiencia || '',
    });
    setShowUpdateDriverModal(true);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDriver({
      ...newDriver,
      [name]: value
    });
  };

const handleDeleteDriver = async (id_conductor, nombre_conductor, apellido_conductor, documento) => {
  const confirmDelete = window.confirm(
    `¿Estás seguro de que quieres eliminar al conductor?\n\n` +
    `Nombre: ${nombre_conductor} ${apellido_conductor}\n` +
    `Documento: ${documento}`
  );
  
  if (confirmDelete) {
    try {
      await apiRequest(`/api/drivers/${id_conductor}`, {
        method: 'DELETE'
      });
      
      // Actualiza la lista de conductores después de eliminar
      setConductores(conductores.filter(conductor => conductor.id_conductor !== id_conductor));
      
      // Mostrar mensaje de éxito
      alert(`Conductor ${nombre_conductor} ${apellido_conductor} eliminado exitosamente`);
      
    } catch (error) {
      console.error('Error:', error);
      alert(`Hubo un error al eliminar el conductor: ${error.message}`);
    }
  }
};

   // Función para actualizar conductor
  const handleSubmitUpdateDriver = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updateConductor = {
      tipo_documento: formData.get('tipo_documento'),
      documento: formData.get('documento'),
      nombre_conductor: formData.get('nombre_conductor'),
      apellido_conductor: formData.get('apellido_conductor'),
      correo_conductor: formData.get('correo_conductor'),
      foto: formData.get('foto'),
      telefono: formData.get('telefono'),
      ciudad: formData.get('ciudad'),
      direccion: formData.get('direccion')
    }
    updateConductor(conductor.id_conductor, updateConductor);
  }

// Función corregida para manejar el envío del formulario
const handleSubmitNewDriver = async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  
  if (form.checkValidity() === false) {
    e.stopPropagation();
    setValidated(true);
    return;
  }

  try {
    setIsUpdating(true);
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Payload ajustado a lo que espera el backend
    const payload = {
      tipo_documento: newDriver.tipo_documento || 'CC',
      documento: parseInt(newDriver.documento, 10),
      nombre_conductor: newDriver.nombre_conductor.trim(),
      apellido_conductor: newDriver.apellido_conductor?.trim() || '',
      correo_conductor: newDriver.correo_conductor.trim(),
      foto: newDriver.foto || '',
      telefono: newDriver.telefono || '',
      ciudad: newDriver.ciudad || '',
      direccion: newDriver.direccion || '',
      tipo_licencia: newDriver.tipo_licencia || '',
      fecha_vencimiento: newDriver.fecha_vencimiento || '',
      experiencia: newDriver.experiencia || '',
      estado: newDriver.estado || 'Activo'
    };

      console.log('Payload a actualizar:', payload);

    // Usar la función apiRequest
    const data = await apiRequest('/api/drivers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    console.log('Conductor creado:', data);
    
    alert('Conductor creado exitosamente');
    setShowNewDriverModal(false);
    
    // Actualizar la lista de conductores
    setConductores(prev => [...prev, data.driver || data]);
    
    // Limpiar el formulario
    setNewDriver({
      tipo_documento: '',
      documento: '',
      nombre_conductor: '',
      apellido_conductor: '',
      correo_conductor: '',
      foto: '',
      telefono: '',
      ciudad: '',
      direccion: '',
      tipo_licencia: '',
      fecha_vencimiento: '',
      experiencia: '',
      contraseña: '',
      estado: 'Activo',
    });
    
    setValidated(false);
    
  } catch (error) {
    console.error('Error completo:', error);
    alert(`Hubo un error al crear el conductor: ${error.message}`);
  } finally {
    setIsUpdating(false);
  }
};

      const payload = {
        tipo_documento: newDriver.tipo_documento || 'CC',
        documento: parseInt(newDriver.documento, 10),
        nombre_conductor: newDriver.nombre_conductor.trim(),
        apellido_conductor: newDriver.apellido_conductor?.trim() || '',
        correo_conductor: newDriver.correo_conductor.trim(),
        foto: newDriver.foto || '',
        telefono: newDriver.telefono || '',
        ciudad: newDriver.ciudad || '',
        direccion: newDriver.direccion || '',
        experiencia: parseInt(newDriver.experiencia, 10) || 0,
        tipo_licencia: newDriver.tipo_licencia || '',
        fecha_vencimiento: newDriver.fecha_vencimiento || null,
        contraseña: newDriver.contraseña || 'defaultPassword123',
        estado: newDriver.estado || 'Activo'
      };

      console.log('Payload a enviar:', payload);

      const response = await fetch('http://localhost:3001/api/drivers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('Respuesta del servidor:', responseText);

      if (!response.ok) {
        let errorMessage = 'Error al crear el Conductor';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(`Error ${response.status}: ${errorMessage}`);
      }

      const data = JSON.parse(responseText);
      console.log('Conductor creado:', data);
      
      alert('Conductor creado exitosamente');
      setShowNewDriverModal(false);
      
      setConductores(prev => [...prev, data.driver || data]);
      
      setNewDriver({
        tipo_documento: '',
        documento: '',
        nombre_conductor: '',
        apellido_conductor: '',
        correo_conductor: '',
        foto: '',
        telefono: '',
        ciudad: '',
        direccion: '',
        tipo_licencia: '',
        fecha_vencimiento: '',
        experiencia: '',
        contraseña: '',
        estado: 'Activo',
      });
      
      setValidated(false);
    } catch (error) {
      console.error('Error completo:', error);
      alert(`Hubo un error al crear el conductor: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  
  // Componente de Paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="pagination-container d-flex justify-content-between align-items-center mt-3">
        <div className="showing-entries">
          Mostrando {indexOfFirstConductor + 1} a {Math.min(indexOfLastConductor, filteredConductores.length)} de {filteredConductores.length} registros
        </div>
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <a className="page-link" href="#!" onClick={() => handlePageChange(Math.max(1, currentPage - 1))}>
              Anterior
            </a>
          </li>
          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${i + 1 === currentPage ? 'active' : ''}`}>
              <a className="page-link" href="#!" onClick={() => handlePageChange(i + 1)}>
                {i + 1}
              </a>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <a className="page-link" href="#!" onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}>
              Siguiente
            </a>
          </li>
        </ul>
      </div>
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
      case 'Entrenamiento':
        variant = 'warning';
        break;
      case 'Inactivo':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    
    return <span className={`badge bg-${variant} rounded-pill`}>{estado}</span>;
  };
  
  
  const conductoresContent = (
    <>
      
      <div className="page-header d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Gestión de Conductores</h1>
        <Button 
          variant="warning" 
          className="d-flex align-items-center"
          onClick={() => setShowNewDriverModal(true)}
        >
          <FaPlus className="me-2" /> Nuevo Conductor
        </Button>
      </div>
      
      {/* Filtros y búsqueda */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6} lg={8}>
              <InputGroup>
                <InputGroup.Text id="basic-addon1" className="bg-warning text-white">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre o cédula"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} lg={4} className="mt-3 mt-md-0">
              <InputGroup>
                <InputGroup.Text id="filter-addon" className="bg-warning text-white">
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
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaUsers className="text-warning me-2" size={20} />
              <h5 className="mb-0">Listado de Conductores</h5>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="conductores-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredConductores.map((conductor, index) => (
                  <tr key={conductor.id_conductor || conductor.id || index}>
                    <td>{conductor.nombre_conductor} {conductor.apellido_conductor}</td>
                    <td>{conductor.documento}</td>
                    <td>{conductor.ciudad}</td>
                    <td>
                      <EstadoBadge estado={conductor.estado} />
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleShowDetails(conductor)}
                        >
                          Ver
                        </Button>
                        <Button variant="outline-warning" size="sm" className="me-1">
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteDriver(conductor.id_conductor)}
                          >
                          <FaTrashAlt />
                        </Button>
                      </div>
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
      
      {/* Modal de detalles del conductor */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>Detalles del Conductor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentDriver && (
            <div className="driver-detail">
              <Row>
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <div className="driver-avatar mb-3">
                    <FaUserCircle size={100} className="text-warning" />
                  </div>
                  <h4>{currentDriver.nombre_conductor}</h4>
                  <p className="mb-1">
                    <EstadoBadge estado={currentDriver.estado} />
                  </p>
                  <p className="text-muted">
                    <FaIdCard className="me-2" />
                    {currentDriver.documento}
                  </p>
                  <p className="text-muted">
                    {currentDriver.tipo_documento}
                  </p>
                </Col>
                <Col md={8}>
                  <h5 className="mb-3">Información de Contacto</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Teléfono:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaPhone className="me-2 text-warning" />
                        {currentDriver.telefono}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Email:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaEnvelope className="me-2 text-warning" />
                        {currentDriver.correo_conductor}
                      </p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Ciudad:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaMapMarkerAlt className="me-2 text-warning" />
                        {currentDriver.ciudad}
                      </p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Información Laboral</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Experiencia:</strong></p>
                      <p>{formatDate(currentDriver.experiencia)}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Último Reporte:</strong></p>
                      <p>{formatDate(currentDriver.ultimoReporte)}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Licencia:</strong></p>
                      <p className="d-flex align-items-center">
                        <Badge bg="warning" className="me-2">
                          {currentDriver.tipo_licencia}
                        </Badge>
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Fecha de vencimiento:</strong></p>
                      <p>{formatDate(currentDriver.fecha_vencimiento)}</p>
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
          <Button variant="warning">
            <FaEdit className="me-2" /> Editar Información
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para crear nuevo conductor */}
      <Modal
        show={showNewDriverModal}
        onHide={() => setShowNewDriverModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Form noValidate validated={validated} onSubmit={handleSubmitNewDriver}>
          <Modal.Header closeButton className="border-bottom border-warning">
            <Modal.Title>
              <FaUserPlus className="me-2 text-warning" />
              Registrar Nuevo Conductor
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="new-driver-form">
              {/* Información personal */}
              <h5 className="border-bottom pb-2 mb-3">Información Personal</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Documento</Form.Label>
                    <Form.Select
                      name="tipo_documento"
                      value={newDriver.tipo_documento}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="PAS">Pasaporte</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Seleccione un tipo de documento
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Número de Documento</Form.Label>
                    <Form.Control
                      type="text"
                      name="documento"
                      value={newDriver.documento}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      El número de documento es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre_conductor"
                      value={newDriver.nombre_conductor}
                      onChange={handleInputChange}
                      required
                      maxLength={45}
                    />
                    <Form.Control.Feedback type="invalid">
                      El nombre es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellido</Form.Label>
                    <Form.Control
                      type="text"
                      name="apellido_conductor"
                      value={newDriver.apellido_conductor}
                      onChange={handleInputChange}
                      required
                      maxLength={45}
                    />
                    <Form.Control.Feedback type="invalid">
                      El apellido es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Correo Electrónico</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-warning text-white">
                        <FaEnvelope />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="correo_conductor"
                        value={newDriver.correo_conductor}
                        onChange={handleInputChange}
                        required
                        maxLength={45}
                      />
                      <Form.Control.Feedback type="invalid">
                        Ingrese un correo electrónico válido
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-warning text-white">
                        <FaPhone />
                      </InputGroup.Text>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={newDriver.telefono}
                        onChange={handleInputChange}
                        required
                        maxLength={45}
                      />
                      <Form.Control.Feedback type="invalid">
                        El teléfono es obligatorio
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>URL de Foto</Form.Label>
                    <Form.Control
                      type="text"
                      name="foto"
                      value={newDriver.foto}
                      onChange={handleInputChange}
                      maxLength={200}
                    />
                    <Form.Text className="text-muted">
                      Opcional: URL de la imagen del conductor
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Dirección y ubicación */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Ubicación</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ciudad</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-warning text-white">
                        <FaMapMarkerAlt />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="ciudad"
                        value={newDriver.ciudad}
                        onChange={handleInputChange}
                        required
                        maxLength={100}
                      />
                      <Form.Control.Feedback type="invalid">
                        La ciudad es obligatoria
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                      type="text"
                      name="direccion"
                      value={newDriver.direccion}
                      onChange={handleInputChange}
                      required
                      maxLength={250}
                    />
                    <Form.Control.Feedback type="invalid">
                      La dirección es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Información de licencia */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Licencia</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Licencia</Form.Label>
                    <Form.Select
                      name="tipo_licencia"
                      value={newDriver.tipo_licencia}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="A1">A1 - Motocicletas</option>
                      <option value="A2">A2 - Motocicletas, motocarros, cuatrimotos</option>
                      <option value="B1">B1 - Automóviles, camionetas</option>
                      <option value="B2">B2 - Camiones rígidos, buses</option>
                      <option value="B3">B3 - Vehículos articulados</option>
                      <option value="C1">C1 - Automóviles, camionetas servicio público</option>
                      <option value="C2">C2 - Camiones rígidos, buses servicio público</option>
                      <option value="C3">C3 - Vehículos articulados servicio público</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Seleccione un tipo de licencia
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Vencimiento</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha_vencimiento"
                      value={newDriver.fecha_vencimiento}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      La fecha de vencimiento es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Años de Experiencia</Form.Label>
                    <Form.Control
                      type="number"
                      name="experiencia"
                      value={newDriver.experiencia}
                      onChange={handleInputChange}
                      min="0"
                      max="50"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Información de cuenta */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Cuenta</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      name="estado"
                      value={newDriver.estado}
                      onChange={handleInputChange}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="En ruta">En ruta</option>
                      <option value="Descanso">Descanso</option>
                      <option value="Entrenamiento">Entrenamiento</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewDriverModal(false)}>
              Cancelar
            </Button>
            <Button variant="warning" type="submit">
              <FaSave className="me-2" /> Guardar Conductor
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
    </>
  );

  return (
    <LayoutBarButton>
      {conductoresContent}
    </LayoutBarButton>
  );
};

export default Conductores;