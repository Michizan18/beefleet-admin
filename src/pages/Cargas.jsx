import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Card, Table, Button, Dropdown, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaTruck, FaBox, FaWeight, FaCalendarAlt,
  FaUserCircle, FaSearch, FaUsers, 
  FaEdit, FaTrashAlt, FaPlus, FaSave,
  FaCar, FaImage, FaUser
  FaBoxes, FaPhone, FaMapMarkerAlt, 
  FaUserCircle,  FaSearch, FaFilter,
  FaEdit, FaTrashAlt, FaPlus, FaSave, FaComments, FaTruck, FaBuilding,
  FaWeightHanging, FaRoute, FaCalendar
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';

// Constantes para mensajes de validación
const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es obligatorio',
  DATE_INVALID: 'La fecha de inicio debe ser anterior a la fecha de fin',
  PESO_FORMAT: 'El peso debe ser un valor válido'
};

const Cargas = () => {
  // Estados principales
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showCargaModal, setShowCargaModal] = useState(false);
  const [currentCarga, setCurrentCarga] = useState(null);
  const [showNewCargaModal, setShowNewCargaModal] = useState(false);
  
  // Estado para nueva carga
  const [newCarga, setNewCarga] = useState({
    referencia: '',
    descripcion: '',
    peso: '',
    cliente: '',
    conductor: ''
  });
  const [editValidated, setEditValidated] = useState(false);
  const [validated, setValidated] = useState(false);
  const [editCarga, setEditCarga] = useState({
    id_carga: '',
    descripcion: '',
    peso: '',
    foto_carga: '',
    fecha_inicio: '',
    fecha_fin: '',
    vehiculo: '',
    cliente: '',
    conductor: ''
  });

  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
  };

    // Función mejorada para procesar la respuesta de MySQL
  const processMySQLResponse = (rawData) => {
    try {
      // Si no hay datos, retornar array vacío
      if (!rawData) return [];
      
      // Si es un array de arrays (resultado directo de MySQL)
      if (Array.isArray(rawData) && rawData.length > 0 && Array.isArray(rawData[0])) {
        return rawData[0].filter(item => item && typeof item === 'object' && item.id_carga);
      }
      
      // Si es un array simple de objetos carga
      if (Array.isArray(rawData)) {
        return rawData.filter(item => item && typeof item === 'object' && item.id_carga);
      }
      
      // Si es un solo objeto carga
      if (typeof rawData === 'object' && rawData.id_carga) {
        return [rawData];
      }
      
      return [];
    } catch (error) {
      console.error('Error processing MySQL response:', error);
      return [];
    }
  };

    // Configurar axios con la base URL y token
useEffect(() => {
  // Log para debugging
  console.log('Clients loaded:', clients);
  console.log('Vehicles loaded:', vehicles);
  console.log('Drivers loaded:', drivers);
  
  if (clientsError) {
    console.error('Clients error:', clientsError);
  }
  if (vehiclesError) {
    console.error('Vehicles error:', vehiclesError);
  }
  if (driversError) {
    console.error('Drivers error:', driversError);
  }
}, [clients, vehicles, drivers, clientsError, vehiclesError, driversError]);


  const { clients, loading: clientsLoading, error: clientsError } = useClients();
  const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles(); // AGREGAR
  const { drivers, loading: driversLoading, error: driversError } = useDrivers(); // AGREGAR


// AGREGAR para debugging:
console.log('Clients data:', clients);
console.log('Clients loading:', clientsLoading);
console.log('Clients error:', clientsError);
  // Función para obtener cargas
  const fetchCargas = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }
      
      // CAMBIAR ESTA LÍNEA - quitar el "?test=true" y verificar que sea la URL correcta
      const response = await fetch('http://localhost:3001/api/loads', {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
          return;
        }
        throw new Error(errorText || 'Error al obtener las cargas'); // CAMBIAR: decía "clientes"
      }

      const data = await response.json();
      const processedData = processMySQLResponse(data);
      
      if (!processedData.length) {
        setError('No se encontraron cargas');
      }

      setCargas(processedData);

    } catch (error) {
      console.error('Error fetching cargas:', error);
      setError(`Error al cargar las cargas: ${error.message}`);
      setCargas([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCargas = cargas.filter((carga) => {
    if (!carga) return false;
    
    // Filtrar por término de búsqueda
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (carga.descripcion && carga.descripcion.toLowerCase().includes(searchLower)) ||
      (carga.cliente && carga.cliente.toString().toLowerCase().includes(searchLower)) ||
      (carga.conductor && carga.conductor.toString().toLowerCase().includes(searchLower));
    
    // Filtrar por estado (por ahora siempre true, puedes implementar lógica de estado)
    const matchesStatus = statusFilter === 'Todos' || true;
    
    return matchesSearch && matchesStatus;
  });
  
  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cliente') {
      // Validar que el NIT existe (solo si hay clientes)
      if (value && clients && clients.length > 0 && !clientUtils.checkNitExists(clients, value)) {
        console.warn('Cliente no encontrado');
      }
    }
    
    setNewCarga(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar envío del formulario
const handleSubmitNewCarga = async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  
  if (form.checkValidity() === false) {
    e.stopPropagation();
    setValidated(true);
    return;
  }
  
  // AGREGAR esta validación:
  if (!clients || clients.length === 0) {
    setError('No se han cargado los clientes. Intente recargar la página.');
    return;
  }
  
  try {
    setLoading(true);
    
    // Preparar datos para envío
    const cargaData = {
      ...newCarga,
      // Convertir strings vacíos a null para campos opcionales
      vehiculo: newCarga.vehiculo || null,
      conductor: newCarga.conductor || null,
      foto_carga: newCarga.foto_carga || null
    };
    
    // VERIFICAR que la URL sea correcta
    await axios.post('/api/loads', cargaData);
    
    // Actualizar la lista de cargas
    await fetchCargas();
    
    // Cerrar modal y resetear form
    setShowNewCargaModal(false);
    setNewCarga({
      descripcion: '',
      peso: '',
      foto_carga: '',
      fecha_inicio: '',
      fecha_fin: '',
      vehiculo: '',
      cliente: '',
      conductor: ''
    });
    setValidated(false);
    setError(null);
  } catch (err) {
    console.error('Error creating carga:', err);
    setError(err.response?.data?.message || 'Error al crear la carga');
  } finally {
    setLoading(false);
  }
};

  const handleEditCarga = (carga) => {

      // Cerrar primero el modal de detalles
  setShowCargaModal(false);
  
  // Pequeño delay para evitar conflictos entre modales
  setTimeout(() => {
    setEditCarga({
      id_carga: carga.id_carga,
      descripcion: carga.descripcion || '',
      peso: carga.peso || '',
      foto_carga: carga.foto_carga || '',
      fecha_inicio: carga.fecha_inicio ? carga.fecha_inicio.split('T')[0] : '',
      fecha_fin: carga.fecha_fin ? carga.fecha_fin.split('T')[0] : '',
      vehiculo: carga.vehiculo || '',
      cliente: carga.cliente || '',
      conductor: carga.conductor || ''
    });
    setShowEditCargaModal(true);
  }, 100);
  };

    const updateCarga = async (cargaId, cargaData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:3001/api/loads/${cargaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cargaData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al actualizar la carga');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating load:', error);
      throw error;
    }
  };

const handleEditInputChange = (e) => {
  const { name, value } = e.target;
  
  // Agregar la misma validación que en handleInputChange
  if (name === 'cliente') {
    // Validar que el NIT existe (solo si hay clientes)
    if (value && clients && clients.length > 0 && !clientUtils.checkNitExists(clients, value)) {
      console.warn('Cliente no encontrado');
    }
  }
  
  setEditCarga(prev => ({
    ...prev,
    [name]: value
  }));
};

    const handleSubmitEditCarga = async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  
  if (form.checkValidity() === false) {
    e.stopPropagation();
    setEditValidated(true);
    return;
  }
  
  try {
    setLoading(true);
    
    // Preparar datos para envío
    const cargaData = {
      descripcion: editCarga.descripcion,
      peso: editCarga.peso,
      foto_carga: editCarga.foto_carga || null,
      fecha_inicio: editCarga.fecha_inicio,
      fecha_fin: editCarga.fecha_fin,
      vehiculo: editCarga.vehiculo || null,
      cliente: editCarga.cliente,
      conductor: editCarga.conductor || null
    };
    
    await axios.put(`/api/loads/${editCarga.id_carga}`, cargaData);
    
    // Actualizar la lista de cargas
    await fetchCargas();
    
    // Cerrar modal y resetear form
    setShowEditCargaModal(false);
    setEditCarga({
      id_carga: '',
      descripcion: '',
      peso: '',
      foto_carga: '',
      fecha_inicio: '',
      fecha_fin: '',
      vehiculo: '',
      cliente: '',
      conductor: ''
    });
    setEditValidated(false);
    setError(null);
  } catch (err) {
    console.error('Error updating carga:', err);
    setError(err.response?.data?.message || 'Error al actualizar la carga');
  } finally {
    setLoading(false);
  }
};
  
  // Eliminar una carga
  const handleDeleteCarga = async (id_carga) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta carga?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/loads/${id_carga}`);
        
        // Actualizar la lista de cargas
        await fetchCargas();
        setError(null);
      } catch (err) {
        console.error('Error deleting carga:', err);
        setError(err.response?.data?.message || 'Error al eliminar la carga');
      } finally {
        setLoading(false);
      }
    }
  };

  // Manejar mostrar detalles
  const handleShowDetails = (carga) => {
    setCurrentCarga(carga);
    setShowCargaModal(true);
  };
  
  // Componente para el badge de estado
  const EstadoBadge = ({ estado }) => {
    let variant;
    switch (estado) {
      case 'En tránsito':
        variant = 'primary';
        break;
      case 'Entregado':
        variant = 'success';
        break;
      case 'Pendiente':
        variant = 'warning';
        break;
      case 'Programado':
        variant = 'info';
        break;
      case 'Cancelado':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    
    return <span className={`badge bg-${variant} rounded-pill`}>{estado}</span>;
  };
  
  if ((loading && cargas.length === 0) || clientsLoading || vehiclesLoading || driversLoading) {
    return (
      <LayoutBarButton userData={userData}>
        <div className="d-flex justify-content-center mt-5">
          <Spinner animation="border" variant="warning" />
          <span className="ms-2">Cargando datos...</span>
        </div>
      </LayoutBarButton>
    );
  }

   const getClientDisplayText = (nit) => {
    if (!clients || !nit) return 'Sin cliente';
    const client = clientUtils.findClientByNit(clients, nit);
    return client ? `${client.nit} - ${client.empresa || 'Sin empresa'}` : `NIT: ${nit}`;
  };

  const getVehicleDisplayText = (vehicleId) => {
    if (!vehicles || !vehicleId) return 'Sin asignar';
    const vehicle = vehicleUtils.findVehicleById(vehicles, vehicleId);
    return vehicle ? `${vehicle.placa} - ${vehicle.marca || ''} ${vehicle.modelo || ''}`.trim() : `ID: ${vehicleId}`;
  };

  const getDriverDisplayText = (driverId) => {
    if (!drivers || !driverId) return 'Sin asignar';
    const driver = driverUtils.findDriverById(drivers, driverId);
    return driver ? `${driver.documento} - ${driver.nombre || ''} ${driver.apellido || ''}`.trim() : `ID: ${driverId}`;
  };

  return (
    <LayoutBarButton userData={userData}>
      {error && (
        <Alert variant="danger" className="mt-3" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {clientsError && (
        <Alert variant="warning" className="mt-3" dismissible>
          Error cargando clientes: {clientsError}
        </Alert>
      )}
      {vehiclesError && (
        <Alert variant="warning" className="mt-3" dismissible>
          Error cargando vehículos: {vehiclesError}
        </Alert>
      )}
      {driversError && (
        <Alert variant="warning" className="mt-3" dismissible>
          Error cargando conductores: {driversError}
        </Alert>
      )}
            
      <div className="page-header d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Gestión de Cargas</h1>
        <Button 
          variant="warning" 
          className="d-flex align-items-center"
          onClick={() => setShowNewCargaModal(true)}
        >
          <FaPlus className="me-2" /> Nueva Carga
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
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
                  placeholder="Buscar por referencia, cliente o destino"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Listado de cargas */}
      <Card>
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaBoxes className="text-warning me-2" size={20} />
              <h5 className="mb-0">Listado de Cargas</h5>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="cargas-table">
              <thead>
                <tr>
                  <th>Referencia</th>
                  <th>Cliente</th>
                  <th>Destino</th>
                  <th>Vehículo</th>
                  <th>Conductor</th>
                  <th>Estado</th>
                  <th>Valor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCargas.map((carga, index) => (
                  <tr key={index}>
                    <td>
                      <div>
                        <strong>{carga.referencia}</strong>
                        <br />
                        <small className="text-muted">{carga.descripcion}</small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaBuilding className="me-2 text-warning" />
                        {carga.cliente}
                      </div>
                    </td>
                    <td>
                      <div>
                        <FaMapMarkerAlt className="me-1 text-danger" />
                        {carga.destino}
                        <br />
                        <small className="text-muted">
                          <FaRoute className="me-1" />
                          desde {carga.origen}
                        </small>
                      </div>
                    </td>
                    <td>
                      {carga.vehiculo !== 'Sin asignar' ? (
                        <div className="d-flex align-items-center">
                          <FaTruck className="me-2 text-warning" />
                          {carga.vehiculo}
                        </div>
                      ) : (
                        <span className="text-muted">{carga.vehiculo}</span>
                      )}
                    </td>
                    <td>
                      {carga.conductor !== 'Sin asignar' ? (
                        <div className="d-flex align-items-center">
                          <FaUserCircle className="me-2 text-warning" />
                          {carga.conductor}
                        </div>
                      ) : (
                        <span className="text-muted">{carga.conductor}</span>
                      )}
                    </td>
                    <td>
                      <EstadoBadge estado={carga.estado} />
                    </td>
                    <td>
                      <strong className="text-success">{carga.valor}</strong>
                      <br />
                      <small className="text-muted">
                        <FaWeightHanging className="me-1" />
                        {carga.peso}
                      </small>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleShowDetails(carga)}
                        >
                          Ver
                        </Button>
                        <Button variant="outline-warning" size="sm" className="me-1">
                          <FaEdit />
                        </Button>
                        <Button variant="outline-danger" size="sm">
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {filteredCargas.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron cargas con los criterios de búsqueda.</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal de detalles de la carga */}
      <Modal 
        show={showCargaModal} 
        onHide={() => setShowCargaModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>Detalles de la Carga</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentCarga && (
            <div className="carga-detail">
              <Row>
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <div className="carga-avatar mb-3">
                    <FaBoxes size={100} className="text-warning" />
                  </div>
                  <h4>{currentCarga.referencia}</h4>
                  <p className="mb-1">
                    <EstadoBadge estado={currentCarga.estado} />
                  </p>
                  <p className="text-success">
                    <strong>{currentCarga.valor}</strong>
                  </p>
                </Col>
                <Col md={8}>
                  <h5 className="mb-3 mt-4">Información de la Carga</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Cliente:</strong></p>
                      <p>
                        <FaBuilding className="me-2 text-warning" />
                        {currentCarga.cliente}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Descripción:</strong></p>
                      <p>{currentCarga.descripcion}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Peso:</strong></p>
                      <p>
                        <FaWeightHanging className="me-2" />
                        {currentCarga.peso}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Teléfono:</strong></p>
                      <p>
                        <FaPhone className="me-2" />
                        {currentCarga.telefono}
                      </p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Ruta y Fechas</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Origen:</strong></p>
                      <p>
                        <FaMapMarkerAlt className="me-2 text-success" />
                        {currentCarga.origen}
                      </p>
                      <small className="text-muted">{currentCarga.direccionOrigen}</small>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Destino:</strong></p>
                      <p>
                        <FaMapMarkerAlt className="me-2 text-danger" />
                        {currentCarga.destino}
                      </p>
                      <small className="text-muted">{currentCarga.direccionDestino}</small>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Fecha Inicio:</strong></p>
                      <p>
                        <FaCalendar className="me-2" />
                        {currentCarga.fechaInicio}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Fecha Fin:</strong></p>
                      <p>
                        <FaCalendar className="me-2" />
                        {currentCarga.fechaFin}
                      </p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Asignación</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Vehículo:</strong></p>
                      {currentCarga.vehiculo !== 'Sin asignar' ? (
                        <p className="d-flex align-items-center">
                          <FaTruck className="me-2 text-warning" />
                          {currentCarga.vehiculo}
                        </p>
                      ) : (
                        <p className="text-muted">Sin asignar</p>
                      )}
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Conductor:</strong></p>
                      {currentCarga.conductor !== 'Sin asignar' ? (
                        <p className="d-flex align-items-center">
                          <FaUserCircle className="me-2 text-warning" />
                          {currentCarga.conductor}
                        </p>
                      ) : (
                        <p className="text-muted">Sin asignar</p>
                      )}
                    </Col>
                  </Row>
                  
                  {currentCarga.observaciones && (
                    <>
                      <h5 className="mb-3 mt-4">Observaciones</h5>
                      <p className="bg-light p-3 rounded">
                        <FaComments className="me-2 text-warning" />
                        {currentCarga.observaciones}
                      </p>
                    </>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCargaModal(false)}>
            Cerrar
          </Button>
          <Button variant="warning">
            <FaEdit className="me-2" /> Editar Información
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para crear nueva carga */}
      <Modal
        show={showNewCargaModal}
        onHide={() => setShowNewCargaModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Form noValidate validated={validated} onSubmit={handleSubmitNewCarga}>
          <Modal.Header closeButton className="border-bottom border-warning">
            <Modal.Title>
              <FaBoxes className="me-2 text-warning" />
              Registrar Nueva Carga
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="new-carga-form">
              {/* Información básica */}
              <h5 className="border-bottom pb-2 mb-3">Información Básica</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Referencia</Form.Label>
                    <Form.Control
                      type="text"
                      name="referencia"
                      value={newCarga.referencia}
                      onChange={handleInputChange}
                      placeholder="Se generará automáticamente"
                    />
                    <Form.Text className="text-muted">
                      Deje vacío para generar automáticamente
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cliente</Form.Label>
                    <Form.Control
                      type="text"
                      name="cliente"
                      value={newCarga.cliente}
                      onChange={handleInputChange}
                      required
                      placeholder="Nombre del cliente"
                    />
                    <Form.Control.Feedback type="invalid">
                      El cliente es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="descripcion"
                      value={newCarga.descripcion}
                      onChange={handleInputChange}
                      required
                      placeholder="Descripción de la carga"
                    />
                    <Form.Control.Feedback type="invalid">
                      La descripción es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Peso</Form.Label>
                    <Form.Control
                      type="text"
                      name="peso"
                      value={newCarga.peso}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: 2.5 ton, 500 kg"
                    />
                    <Form.Control.Feedback type="invalid">
                      El peso es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Valor</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="valor"
                        value={newCarga.valor}
                        onChange={handleInputChange}
                        required
                        placeholder="500,000"
                      />
                      <Form.Control.Feedback type="invalid">
                        El valor es obligatorio
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Información de contacto */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Contacto</h5>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="tel"
                      name="telefono"
                      value={newCarga.telefono}
                      onChange={handleInputChange}
                      required
                      placeholder="3001234567"
                    />
                    <Form.Control.Feedback type="invalid">
                      El teléfono es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Ruta */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Ruta</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Origen</Form.Label>
                    <Form.Control
                      type="text"
                      name="origen"
                      value={newCarga.origen}
                      onChange={handleInputChange}
                      required
                      placeholder="Ciudad de origen"
                    />
                    <Form.Control.Feedback type="invalid">
                      El origen es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Destino</Form.Label>
                    <Form.Control
                      type="text"
                      name="destino"
                      value={newCarga.destino}
                      onChange={handleInputChange}
                      required
                      placeholder="Ciudad de destino"
                    />
                    <Form.Control.Feedback type="invalid">
                      El destino es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección de Origen</Form.Label>
                    <Form.Control
                      type="text"
                      name="direccionOrigen"
                      value={newCarga.direccionOrigen}
                      onChange={handleInputChange}
                      required
                      placeholder="Dirección completa de origen"
                    />
                    <Form.Control.Feedback type="invalid">
                      La dirección de origen es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección de Destino</Form.Label>
                    <Form.Control
                      type="text"
                      name="direccionDestino"
                      value={newCarga.direccionDestino}
                      onChange={handleInputChange}
                      required
                      placeholder="Dirección completa de destino"
                    />
                    <Form.Control.Feedback type="invalid">
                      La dirección de destino es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Fechas */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Fechas</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Inicio</Form.Label>
                    <Form.Control
                      type="date"
                      name="fechaInicio"
                      value={newCarga.fechaInicio}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      La fecha de inicio es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Fin</Form.Label>
                    <Form.Control
                      type="date"
                      name="fechaFin"
                      value={newCarga.fechaFin}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      La fecha de fin es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Asignación */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Asignación</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vehículo</Form.Label>
                    <Form.Select
                      name="vehiculo"
                      value={newCarga.vehiculo}
                      onChange={handleInputChange}
                    >
                      <option value="">Sin asignar</option>
                      <option value="ABC-123">ABC-123 - Toyota Hilux</option>
                      <option value="XYZ-789">XYZ-789 - Ford Transit</option>
                      <option value="DEF-456">DEF-456 - Chevrolet NPR</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Puede dejar sin asignar y seleccionar un vehículo más tarde
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Conductor</Form.Label>
                    <Form.Select
                      name="conductor"
                      value={newCarga.conductor}
                      onChange={handleInputChange}
                    >
                      <option value="">Sin asignar</option>
                      <option value="Luis Martínez">Luis Martínez</option>
                      <option value="Pablo Cárdenas">Pablo Cárdenas</option>
                      <option value="Ana López">Ana López</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Puede dejar sin asignar y seleccionar un conductor más tarde
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      name="estado"
                      value={newCarga.estado}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Programado">Programado</option>
                      <option value="En tránsito">En tránsito</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Observaciones */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Observaciones</h5>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Observaciones</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="observaciones"
                      value={newCarga.observaciones}
                      onChange={handleInputChange}
                      placeholder="Observaciones adicionales sobre la carga (opcional)"
                    />
                    <Form.Text className="text-muted">
                      Incluya información importante sobre manejo especial, horarios de entrega, etc.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewCargaModal(false)}>
              Cancelar
            </Button>
            <Button variant="warning" type="submit">
              <FaSave className="me-2" /> Guardar Carga
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </LayoutBarButton>
  );
};

export default Cargas;