import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Container, Row, Col, InputGroup, Form, Modal, Badge, Alert } from 'react-bootstrap';
import { 
  FaIdCard, FaUserCircle, FaSearch, FaEdit, FaTrashAlt, FaPlus, 
  FaSave, FaCalendarPlus, FaPhone, FaMapMarkerAlt, FaEnvelope,
  FaCarSide, FaCamera, FaUser, FaHome, FaCalendarAlt, FaClock, FaTimes,
  FaCheckCircle, FaSpinner
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';

// Constantes para tipos de documento
const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PA', label: 'Pasaporte' }
];

// Constantes para tipos de licencia
const LICENSE_TYPES = [
  { value: 'A1', label: 'A1 - Motocicletas' },
  { value: 'A2', label: 'A2 - Motocicletas, motocarros, cuatrimotos' },
  { value: 'B1', label: 'B1 - Automóviles, camionetas' },
  { value: 'B2', label: 'B2 - Camiones rígidos, buses' },
  { value: 'B3', label: 'B3 - Vehículos articulados' },
  { value: 'C1', label: 'C1 - Automóviles, camionetas servicio público' },
  { value: 'C2', label: 'C2 - Camiones rígidos, buses servicio público' },
  { value: 'C3', label: 'C3 - Vehículos articulados servicio público' }
];

// Constantes para estados del conductor
const DRIVER_STATUS = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Inactivo', label: 'Inactivo' },
  { value: 'En ruta', label: 'En ruta' },
  { value: 'Descanso', label: 'Descanso' },
  { value: 'Entrenamiento', label: 'Entrenamiento' }
];

const Conductores = () => {
  // Estados principales
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Estados para modales
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showNewDriverModal, setShowNewDriverModal] = useState(false);
  const [showEditDriverModal, setShowEditDriverModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Estados para conductores
  const [currentDriver, setCurrentDriver] = useState(null);
  const [driverToDelete, setDriverToDelete] = useState(null);
  
  // Estado inicial para nuevo conductor
  const initialDriverState = {
    tipo_documento: 'CC',
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
    estado: 'Activo',
  };
  
  const [newDriver, setNewDriver] = useState(initialDriverState);
  const [editDriver, setEditDriver] = useState(initialDriverState);
  
  // Estados de validación
  const [validated, setValidated] = useState(false);
  const [editValidated, setEditValidated] = useState(false);

  // Estados para alertas y mensajes de éxito
  const [showSendingAlert, setShowSendingAlert] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successSubMessage, setSuccessSubMessage] = useState('');

  // Función para obtener el token de autenticación
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('token');
    console.log(token ? `Bearer ${token}` : "XXXX")
    return token ? `Bearer ${token}` : null;
  }, []);

  // Función para normalizar datos de conductores
  const normalizeDriverData = useCallback((driver) => {
    return {
      id_conductor: driver.id_conductor || driver.id || '',
      tipo_documento: driver.tipo_documento || 'CC',
      documento: driver.documento || '',
      nombre_conductor: driver.nombre_conductor || '',
      apellido_conductor: driver.apellido_conductor || '',
      correo_conductor: driver.correo_conductor || '',
      foto: driver.foto || '',
      telefono: driver.telefono || '',
      ciudad: driver.ciudad || '',
      direccion: driver.direccion || '',
      tipo_licencia: driver.tipo_licencia || '',
      fecha_vencimiento: driver.fecha_vencimiento || '',
      experiencia: driver.experiencia || '',
      estado: driver.estado || 'Activo',
      fecha_registro: driver.fecha_registro || ''
    };
  }, []);

  // Función para obtener todos los conductores
  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:3001/api/drivers', {
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
        throw new Error(errorText || 'Error al obtener los conductores');
      }

      const data = await response.json();
      const processedData = Array.isArray(data) ? data.map(normalizeDriverData) : [normalizeDriverData(data)];
      
      if (!processedData.length) {
        setError('No se encontraron conductores');
      }
      
      setDrivers(processedData);
      
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError(`Error al cargar los conductores: ${error.message}`);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, normalizeDriverData]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Función para crear un nuevo conductor
  const handleSubmitNewDriver = async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const token = getAuthToken();
  
  if (!token) {
    setError('No hay token de autenticación');
    return;
  }

  if (form.checkValidity() === false) {
    e.stopPropagation();
    setValidated(true);
    return;
  }

  try {
    setIsUpdating(true);

    // Validar campos requeridos
    if (!newDriver.documento || !newDriver.nombre_conductor || !newDriver.correo_conductor) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    // Mostrar alert de envío de contraseña
    setShowSendingAlert(true);
    setTimeout(() => setShowSendingAlert(false), 3000);

    // Preparar payload
    const payload = {
      ...newDriver,
      documento: newDriver.documento.toString(),
      nombre_conductor: newDriver.nombre_conductor.trim(),
      apellido_conductor: newDriver.apellido_conductor.trim(),
      correo_conductor: newDriver.correo_conductor.trim(),
      experiencia: newDriver.experiencia ? parseInt(newDriver.experiencia, 10) : null,
      foto: newDriver.foto || null,
      telefono: newDriver.telefono || null,
      ciudad: newDriver.ciudad || null,
      direccion: newDriver.direccion || null,
      tipo_licencia: newDriver.tipo_licencia || null,
      fecha_vencimiento: newDriver.fecha_vencimiento || null
    };

    const response = await fetch('http://localhost:3001/api/drivers', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    
    // Cerrar modal de crear y mostrar modal de éxito
    setShowNewDriverModal(false);
    setSuccessMessage('¡Conductor creado exitosamente!');
    setSuccessSubMessage('Contraseña enviada al correo electrónico');
    setShowSuccessModal(true);
    
    // Ocultar modal de éxito después de 3 segundos
    setTimeout(() => setShowSuccessModal(false), 3000);
    
    setDrivers(prev => [...prev, normalizeDriverData(data.driver || data)]);
    setNewDriver(initialDriverState);
    setValidated(false);

  } catch (error) {
    console.error('Error:', error);
    alert(`Hubo un error al crear el conductor: ${error.message}`);
  } finally {
    setIsUpdating(false);
  }
};

  // Función para editar un conductor
  const updateDriver = useCallback(async (id_conductor, driverData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:3001/api/drivers/${id_conductor}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(driverData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al actualizar el conductor');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating driver:', error.message);
      throw error;
    }
  }, [getAuthToken]);

  // Función para eliminar un conductor
  const deleteDriver = useCallback(async (driverId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:3001/api/drivers/${driverId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al eliminar el conductor');
      }

      return true;
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw error;
    }
  }, [getAuthToken]);

  // Handlers para cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDriver(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditDriver(prev => ({ ...prev, [name]: value }));
  };

  // Handler para mostrar detalles del conductor
  const handleShowDetails = useCallback((driver) => {
    if (!driver) {
      setError('Conductor inválido seleccionado');
      return;
    }
    
    setCurrentDriver(normalizeDriverData(driver));
    setShowDriverModal(true);
    setError(null);
  }, [normalizeDriverData]);

  // Handler para editar conductor
  const handleEditDriver = useCallback((driver) => {
    if (!driver) {
      setError('Conductor inválido para editar');
      return;
    }
    
    setShowDriverModal(false);
    setEditDriver(normalizeDriverData(driver));
    setShowEditDriverModal(true);
    setEditValidated(false);
    setError(null);
  }, [normalizeDriverData]);

  // Handler para eliminar conductor
  const handleDeleteDriver = useCallback((driverId) => {
    const driver = drivers.find(d => d.id_conductor === driverId);
    if (driver) {
      setDriverToDelete(driver);
      setShowDeleteModal(true);
    }
  }, [drivers]);

  // Handler para enviar edición de conductor
const handleSubmitEditDriver = async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  
  if (form.checkValidity() === false) {
    e.stopPropagation();
    setEditValidated(true);
    return;
  }
  
  try {
    setLoading(true);
    const { id_conductor, ...driverData } = editDriver;
    await updateDriver(id_conductor, driverData);
    await fetchDrivers();
    
    setShowEditDriverModal(false);
    setEditValidated(false);
    setError(null);
    
    // Mostrar modal de éxito para edición
    setSuccessMessage('¡Conductor actualizado exitosamente!');
    setSuccessSubMessage('Los cambios han sido guardados correctamente');
    setShowEditSuccessModal(true);
    
    // Ocultar modal después de 3 segundos
    setTimeout(() => setShowEditSuccessModal(false), 3000);
    
  } catch (error) {
    setError(`Error al actualizar el conductor: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  // Confirmar eliminación de conductor
const confirmDeleteDriver = async () => {
  if (!driverToDelete) return;
  
  try {
    setLoading(true);
    await deleteDriver(driverToDelete.id_conductor);
    await fetchDrivers();
    setShowDeleteModal(false);
    setDriverToDelete(null);
    setError(null);
    
    // Mostrar modal de éxito para eliminación
    setSuccessMessage('¡Conductor eliminado exitosamente!');
    setSuccessSubMessage('El conductor ha sido removido del sistema');
    setShowDeleteSuccessModal(true);
    
    // Ocultar modal después de 3 segundos
    setTimeout(() => setShowDeleteSuccessModal(false), 3000);
    
  } catch (error) {
    setError(`Error al eliminar el conductor: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  // Filtrar conductores
  const filteredDrivers = drivers.filter((driver) => {
    if (!driver?.id_conductor) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (driver.documento?.toString() || '').toLowerCase().includes(searchLower) ||
      (driver.nombre_conductor?.toLowerCase() || '').includes(searchLower) ||
      (driver.apellido_conductor?.toLowerCase() || '').includes(searchLower) ||
      (driver.ciudad?.toLowerCase() || '').includes(searchLower) ||
      (driver.correo_conductor?.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <LayoutBarButton userData={userData}>
      <div className="page-header d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Gestión de Conductores</h1>
        <Button 
          variant="warning" 
          className="d-flex align-items-center"
          onClick={() => setShowNewDriverModal(true)}
          disabled={loading}
        >
          <FaPlus className="me-2" /> Nuevo Conductor
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
                  placeholder="Buscar por documento, nombre, apellido, municipio o email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
              <FaCarSide className="text-warning me-2" size={20} />
              <h5 className="mb-0">Listado de Conductores</h5>
            </div>
            <small className="text-muted">
              {filteredDrivers.length} conductor(es) encontrado(s)
            </small>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="conductores-table">
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Nombre Completo</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Municipio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id_conductor}>
                      <td>
                        <div>
                          <small className="text-muted mb-2">{driver.tipo_documento}</small>
                          <br />
                          <strong>{driver.documento || 'N/A'}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaUserCircle className="me-2 text-warning" />
                          {`${driver.nombre_conductor || ''} ${driver.apellido_conductor || ''}`.trim() || 'Sin nombre'}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaEnvelope className="me-2 text-muted" />
                          {driver.correo_conductor || 'Sin email'}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaPhone className="me-2 text-muted" />
                          {driver.telefono || 'Sin teléfono'}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-2 text-muted" />
                          {driver.ciudad || 'Sin municipio'}
                        </div>
                      </td>
                      <td>
                        <Badge 
                          bg={
                            driver.estado === 'Activo' ? 'success' :
                            driver.estado === 'En ruta' ? 'primary' :
                            driver.estado === 'Descanso' ? 'warning' :
                            driver.estado === 'Entrenamiento' ? 'info' :
                            'secondary'
                          }
                        >
                          {driver.estado || 'Sin estado'}
                        </Badge>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleShowDetails(driver)}
                          >
                            Ver
                          </Button>
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleEditDriver(driver)}
                            disabled={loading}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteDriver(driver.id_conductor)}
                            disabled={loading}
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
          )}
          
          {!loading && filteredDrivers.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron conductores con los criterios de búsqueda.</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal de detalles del conductor */}
      <Modal 
        show={showDriverModal} 
        onHide={() => setShowDriverModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>
            <FaUser className="me-2 text-warning" />
            Detalles del Conductor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentDriver && (
            <div className="driver-detail">
              <h5 className="border-bottom pb-2 mb-3">Información de Identificación</h5>
              <Row className="mb-4">
                <Col md={4} className="text-center">
                  <div className="mb-3">
                    {currentDriver.foto ? (
                      <img 
                        src={currentDriver.foto} 
                        alt="Foto del conductor" 
                        className="rounded-circle"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                        style={{ width: '120px', height: '120px' }}
                      >
                        <FaCamera className="text-muted" size={40} />
                      </div>
                    )}
                  </div>
                </Col>
                <Col md={8}>
                  <Row>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Tipo de Documento:</strong></p>
                      <p>
                        <Badge bg="info" className="fs-6">{currentDriver.tipo_documento}</Badge>
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Número de Documento:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaIdCard className="me-2 text-warning" />
                        {currentDriver.documento}
                      </p>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <h5 className="border-bottom pb-2 mb-3">Información Personal</h5>
              <Row className="mb-4">
                <Col sm={6}>
                  <p className="mb-1"><strong>Nombre:</strong></p>
                  <p>{currentDriver.nombre_conductor}</p>
                </Col>
                <Col sm={6}>
                  <p className="mb-1"><strong>Apellido:</strong></p>
                  <p>{currentDriver.apellido_conductor}</p>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Contacto</h5>
              <Row className="mb-4">
                <Col sm={6}>
                  <p className="mb-1"><strong>Email:</strong></p>
                  <p className="d-flex align-items-center">
                    <FaEnvelope className="me-2 text-warning" />
                    <span className="text-break">{currentDriver.correo_conductor}</span>
                  </p>
                </Col>
                <Col sm={6}>
                  <p className="mb-1"><strong>Teléfono:</strong></p>
                  <p className="d-flex align-items-center">
                    <FaPhone className="me-2 text-warning" />
                    {currentDriver.telefono}
                  </p>
                </Col>
              </Row>
              <Row className="mb-4">
                <Col sm={6}>
                  <p className="mb-1"><strong>Municipio:</strong></p>
                  <p className="d-flex align-items-center">
                    <FaMapMarkerAlt className="me-2 text-warning" />
                    {currentDriver.ciudad}
                  </p>
                </Col>
                <Col sm={6}>
                  <p className="mb-1"><strong>Dirección:</strong></p>
                  <p className="d-flex align-items-center">
                    <FaHome className="me-2 text-warning" />
                    {currentDriver.direccion}
                  </p>
                </Col>
              </Row>

              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Licencia</h5>
              <Row className="mb-4">
                <Col sm={6}>
                  <p className="mb-1"><strong>Tipo de Licencia:</strong></p>
                  <p>
                    <Badge bg="success" className="fs-6">
                      {currentDriver.tipo_licencia}
                    </Badge>
                    <br />
                    <small className="text-muted">
                      {LICENSE_TYPES.find(l => l.value === currentDriver.tipo_licencia)?.label || ''}
                    </small>
                  </p>
                </Col>
                <Col sm={6}>
                  <p className="mb-1"><strong>Fecha de Vencimiento:</strong></p>
                  <p className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2 text-warning" />
                    {currentDriver.fecha_vencimiento ? 
                      new Date(currentDriver.fecha_vencimiento).toLocaleDateString('es-CO') : 
                      'No especificada'
                    }
                  </p>
                </Col>
              </Row>
              <Row className="mb-4">
                <Col sm={6}>
                  <p className="mb-1"><strong>Años de Experiencia:</strong></p>
                  <p className="d-flex align-items-center">
                    <FaClock className="me-2 text-warning" />
                    {currentDriver.experiencia ? `${currentDriver.experiencia} años` : 'No especificado'}
                  </p>
                </Col>
              </Row>

              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Cuenta</h5>
              <Row className="mb-3">
                <Col sm={6}>
                  <p className="mb-1"><strong>Estado:</strong></p>
                  <p>
                    <Badge 
                      bg={
                        currentDriver.estado === 'Activo' ? 'success' :
                        currentDriver.estado === 'En ruta' ? 'primary' :
                        currentDriver.estado === 'Descanso' ? 'warning' :
                        currentDriver.estado === 'Entrenamiento' ? 'info' :
                        'secondary'
                      }
                      className="fs-6"
                    >
                      {currentDriver.estado || 'No especificado'}
                    </Badge>
                  </p>
                </Col>
                <Col sm={6}>
                  <p className="mb-1"><strong>Fecha de Registro:</strong></p>
                  <p className="d-flex align-items-center">
                    <FaCalendarPlus className="me-2 text-warning" />
                    {currentDriver.fecha_registro ? 
                      new Date(currentDriver.fecha_registro).toLocaleDateString('es-CO') : 
                      'No disponible'
                    }
                  </p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDriverModal(false)}>
            <FaTimes className="me-2" />
            Cerrar
          </Button>
          <Button variant="warning" onClick={() => handleEditDriver(currentDriver)}>
            <FaEdit className="me-2" /> 
            Editar Información
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para crear nuevo conductor */}
      <Modal
        show={showNewDriverModal}
        onHide={() => {
          setShowNewDriverModal(false);
          setValidated(false);
          setNewDriver(initialDriverState);
        }}
        size="lg"
        centered
        backdrop="static"
      >
        <Form noValidate validated={validated} onSubmit={handleSubmitNewDriver}>
          <Modal.Header closeButton className="border-bottom border-warning">
            <Modal.Title>
              <FaCarSide className="me-2 text-warning" />
              Registrar Nuevo Conductor
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="new-driver-form">
              <h5 className="border-bottom pb-2 mb-3">Información de Identificación</h5>
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
                      {DOCUMENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      El tipo de documento es obligatorio
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
                      placeholder="Ingrese el número de documento"
                    />
                    <Form.Control.Feedback type="invalid">
                      El número de documento es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información Personal</h5>
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
                      placeholder="Ingrese el nombre"
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
                      placeholder="Ingrese el apellido"
                    />
                    <Form.Control.Feedback type="invalid">
                      El apellido es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Contacto</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="correo_conductor"
                      value={newDriver.correo_conductor}
                      onChange={handleInputChange}
                      required
                      placeholder="ejemplo@correo.com"
                    />
                    <Form.Control.Feedback type="invalid">
                      Ingrese un email válido
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="tel"
                      name="telefono"
                      value={newDriver.telefono}
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
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Municipio</Form.Label>
                    <Form.Control
                      type="text"
                      name="ciudad"
                      value={newDriver.ciudad}
                      onChange={handleInputChange}
                      required
                      placeholder="Municipio de residencia"
                    />
                    <Form.Control.Feedback type="invalid">
                      El municipio es obligatorio
                    </Form.Control.Feedback>
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
                      placeholder="Dirección completa"
                    />
                    <Form.Control.Feedback type="invalid">
                      La dirección es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
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
                      {LICENSE_TYPES.map(license => (
                        <option key={license.value} value={license.value}>
                          {license.label}
                        </option>
                      ))}
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
                      type="text"
                      name="experiencia"
                      value={newDriver.experiencia}
                      onChange={handleInputChange}
                      pattern="[0-9]*"
                      title="Solo números"
                      placeholder="Años de experiencia"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
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
                      {DRIVER_STATUS.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>URL de Foto (Opcional)</Form.Label>
                <Form.Control
                  type="url"
                  name="foto"
                  value={newDriver.foto}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com/foto.jpg"
                />
                <Form.Text className="text-muted">
                  Ingrese la URL de una imagen para la foto del conductor
                </Form.Text>
              </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowNewDriverModal(false);
                setValidated(false);
                setNewDriver(initialDriverState);
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              variant="warning" 
              type="submit"
              disabled={loading || isUpdating}
            >
              {isUpdating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Guardar Conductor
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Modal para editar conductor */}
      <Modal
        show={showEditDriverModal}
        onHide={() => {
          setShowEditDriverModal(false);
          setEditValidated(false);
        }}
        size="lg"
        centered
        backdrop="static"
      >
        <Form noValidate validated={editValidated} onSubmit={handleSubmitEditDriver}>
          <Modal.Header closeButton className="border-bottom border-warning">
            <Modal.Title>
              <FaEdit className="me-2 text-warning" />
              Editar Conductor
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="edit-driver-form">
              <h5 className="border-bottom pb-2 mb-3">Información de Identificación</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Documento</Form.Label>
                    <Form.Select
                      name="tipo_documento"
                      value={editDriver.tipo_documento}
                      onChange={handleEditInputChange}
                      required
                    >
                      {DOCUMENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      El tipo de documento es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Número de Documento (No editable)</Form.Label>
                    <Form.Control
                      type="text"
                      name="documento"
                      value={editDriver.documento}
                      readOnly
                      className="bg-light"
                      style={{ cursor: 'not-allowed' }}
                    />
                    <Form.Text className="text-muted">
                      El número de documento es el identificador único del conductor y no puede ser modificado
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información Personal</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre_conductor"
                      value={editDriver.nombre_conductor}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Ingrese el nombre"
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
                      value={editDriver.apellido_conductor}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Ingrese el apellido"
                    />
                    <Form.Control.Feedback type="invalid">
                      El apellido es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Contacto</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="correo_conductor"
                      value={editDriver.correo_conductor}
                      onChange={handleEditInputChange}
                      required
                      placeholder="ejemplo@correo.com"
                    />
                    <Form.Control.Feedback type="invalid">
                      Ingrese un email válido
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="tel"
                      name="telefono"
                      value={editDriver.telefono}
                      onChange={handleEditInputChange}
                      required
                      placeholder="3001234567"
                    />
                    <Form.Control.Feedback type="invalid">
                      El teléfono es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Municipio</Form.Label>
                    <Form.Control
                      type="text"
                      name="ciudad"
                      value={editDriver.ciudad}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Municipio de residencia"
                    />
                    <Form.Control.Feedback type="invalid">
                      El municipio es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                      type="text"
                      name="direccion"
                      value={editDriver.direccion}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Dirección completa"
                    />
                    <Form.Control.Feedback type="invalid">
                      La dirección es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Licencia</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Licencia</Form.Label>
                    <Form.Select
                      name="tipo_licencia"
                      value={editDriver.tipo_licencia}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {LICENSE_TYPES.map(license => (
                        <option key={license.value} value={license.value}>
                          {license.label}
                        </option>
                      ))}
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
                      value={editDriver.fecha_vencimiento}
                      onChange={handleEditInputChange}
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
                      type="text"
                      name="experiencia"
                      value={editDriver.experiencia}
                      onChange={handleEditInputChange}
                      pattern="[0-9]*"
                      title="Solo números"
                      placeholder="Años de experiencia"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Cuenta</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      name="estado"
                      value={editDriver.estado}
                      onChange={handleEditInputChange}
                    >
                      {DRIVER_STATUS.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>URL de Foto (Opcional)</Form.Label>
                <Form.Control
                  type="url"
                  name="foto"
                  value={editDriver.foto}
                  onChange={handleEditInputChange}
                  placeholder="https://ejemplo.com/foto.jpg"
                />
                <Form.Text className="text-muted">
                  Ingrese la URL de una imagen para la foto del conductor
                </Form.Text>
              </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowEditDriverModal(false);
                setEditValidated(false);
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              variant="warning" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Actualizando...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Actualizar Conductor
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Modal de confirmación para eliminar */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-bottom border-danger">
          <Modal.Title className="text-danger">
            <FaTrashAlt className="me-2" />
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {driverToDelete && (
            <div className="text-center">
              <div className="mb-3">
                <FaUser size={40} className="text-danger" />
              </div>
              <p className="mb-3">
                ¿Está seguro que desea eliminar al conductor?
              </p>
              <div className="alert alert-light">
                <strong>
                  {driverToDelete.nombre_conductor} {driverToDelete.apellido_conductor}
                </strong>
                <br />
                <small className="text-muted">
                  {driverToDelete.tipo_documento}: {driverToDelete.documento}
                </small>
              </div>
              <p className="text-danger small">
                <strong>Esta acción no se puede deshacer.</strong>
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDeleteDriver}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Eliminando...
              </>
            ) : (
              <>
                <FaTrashAlt className="me-2" />
                Sí, Eliminar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
          {/* Alert flotante para envío de contraseña */}
    {showSendingAlert && (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '300px'
      }}>
        <Alert variant="info" className="d-flex align-items-center shadow">
          <FaSpinner className="me-2 fa-spin" />
          <div>
            <strong>Enviando contraseña por defecto</strong>
            <br />
            <small>Se está enviando al correo del conductor...</small>
          </div>
        </Alert>
      </div>
    )}

    {/* Modal de éxito para crear conductor */}
    <Modal
      show={showSuccessModal}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body className="text-center py-4">
        <div className="mb-3">
          <FaCheckCircle size={50} className="text-success" />
        </div>
        <h5 className="text-success mb-2">{successMessage}</h5>
        <p className="text-muted mb-0">
          <FaEnvelope className="me-1" />
          {successSubMessage}
        </p>
      </Modal.Body>
    </Modal>

    {/* Modal de éxito para editar conductor */}
    <Modal
      show={showEditSuccessModal}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body className="text-center py-4">
        <div className="mb-3">
          <FaCheckCircle size={50} className="text-success" />
        </div>
        <h5 className="text-success mb-2">{successMessage}</h5>
        <p className="text-muted mb-0">{successSubMessage}</p>
      </Modal.Body>
    </Modal>

    {/* Modal de éxito para eliminar conductor */}
    <Modal
      show={showDeleteSuccessModal}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body className="text-center py-4">
        <div className="mb-3">
          <FaCheckCircle size={50} className="text-success" />
        </div>
        <h5 className="text-success mb-2">{successMessage}</h5>
        <p className="text-muted mb-0">{successSubMessage}</p>
      </Modal.Body>
    </Modal>
    </LayoutBarButton>
  );
};

export default Conductores;