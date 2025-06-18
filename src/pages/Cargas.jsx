import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { 
  FaTruck, FaBox, FaWeight, FaCalendarAlt,
  FaUserCircle, FaSearch, FaUsers, 
  FaEdit, FaTrashAlt, FaPlus, FaSave,
  FaCar, FaImage, FaUser
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import Swal from 'sweetalert2';

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
  const [cargas, setCargas] = useState([]);
  
  // Estados para datos relacionados
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  // Estados para modales
  const [showCargaModal, setShowCargaModal] = useState(false);
  const [showNewCargaModal, setShowNewCargaModal] = useState(false);
  const [showEditCargaModal, setShowEditCargaModal] = useState(false);
  
  // Estados para cargas
  const [currentCarga, setCurrentCarga] = useState(null);
  const [newCarga, setNewCarga] = useState({
    descripcion: '',
    peso: '',
    foto_carga: '',
    fecha_inicio: '',
    fecha_fin: '',
    vehiculo: '',
    cliente: '',
    estado: ''
  });
  
  const [editCarga, setEditCarga] = useState({
    id_carga: '',
    descripcion: '',
    peso: '',
    foto_carga: '',
    fecha_inicio: '',
    fecha_fin: '',
    vehiculo: '',
    cliente: '',
    estado: ''
  });
  
  // Estados de validación
  const [validated, setValidated] = useState(false);
  const [editValidated, setEditValidated] = useState(false);

    const showAlert = useCallback((type, title, text = '', timer = null) => {
  const config = {
    title,
    text,
    icon: type,
    confirmButtonColor: '#ffc107',
    cancelButtonColor: '#6c757d',
    background: '#fff',
    color: '#333',
    showConfirmButton: timer ? false : true,
  };
  
  if (timer) {
    config.timer = timer;
    config.timerProgressBar = true;
  }
  
  return Swal.fire(config);
}, []);

  // Función para obtener el token de autenticación
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
  }, []);

  // Función para procesar respuesta de MySQL
  const processMySQLResponse = useCallback((rawData) => {
    try {
      console.log('🔍 Datos recibidos de la API:', rawData);
      
      if (!rawData) return [];
      
      let processedData = [];
      
      if (Array.isArray(rawData)) {
        if (rawData.length > 0 && Array.isArray(rawData[0])) {
          processedData = rawData[0];
        } else {
          processedData = rawData;
        }
      } else if (typeof rawData === 'object') {
        processedData = [rawData];
      }
      
      return processedData;
      
    } catch (error) {
      console.error('❌ Error procesando respuesta MySQL:', error);
      return [];
    }
  }, []);

  // Función para obtener todas las cargas
  const fetchCargas = useCallback(async () => {
  setLoading(true);
  
  try {
    const token = getAuthToken();
    if (!token) {
      showAlert('error', 'Sin autenticación', 'No hay token de autenticación');
      setLoading(false);
      return;
    }
    
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
        showAlert('error', 'Sesión expirada', 'Por favor, inicie sesión nuevamente.');
        return;
      }
      throw new Error(errorText || 'Error al obtener las cargas');
    }

    const data = await response.json();
    const processedData = processMySQLResponse(data);
    
    setCargas(processedData);
    
  } catch (error) {
    console.error('Error fetching cargas:', error);
    showAlert('error', 'Error de carga', `Error al cargar las cargas: ${error.message}`);
    setCargas([]);
  } finally {
    setLoading(false);
  }
}, [getAuthToken, processMySQLResponse, showAlert]);

  // Función para obtener clientes
  const fetchClients = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3001/api/clients', {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const processedData = processMySQLResponse(data);
        setClients(processedData);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }, [getAuthToken, processMySQLResponse]);

  // Función para obtener vehículos (asumiendo endpoint similar)
  const fetchVehicles = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3001/api/vehicles', {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const processedData = processMySQLResponse(data);
        setVehicles(processedData);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  }, [getAuthToken, processMySQLResponse]);

  // Función para obtener conductores (asumiendo endpoint similar)
  const fetchDrivers = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3001/api/drivers', {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const processedData = processMySQLResponse(data);
        setDrivers(processedData);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  }, [getAuthToken, processMySQLResponse]);

  // Función para crear una nueva carga
  const createNewCarga = useCallback(async (cargaData) => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3001/api/loads', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cargaData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al crear la carga');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating carga:', error);
      throw error;
    }
  }, [getAuthToken]);

  // Función para editar una carga
  const updateCarga = useCallback(async (cargaId, cargaData) => {
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
      console.error('Error updating carga:', error);
      throw error;
    }
  }, [getAuthToken]);

  // Función para eliminar una carga
  const deleteCarga = useCallback(async (cargaId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:3001/api/loads/${cargaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al eliminar la carga');
      }

      return true;
    } catch (error) {
      console.error('Error deleting carga:', error);
      throw error;
    }
  }, [getAuthToken]);

  // Efectos para cargar datos
useEffect(() => {
  fetchCargas();
  fetchClients();
  fetchVehicles();
  fetchDrivers();
}, [fetchCargas, fetchClients, fetchVehicles, fetchDrivers]);

  // Filtrar cargas
  const filteredCargas = cargas.filter((carga) => {
    if (!carga?.id_carga) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (carga.descripcion?.toLowerCase() || '').includes(searchLower) ||
      (carga.peso?.toString() || '').toLowerCase().includes(searchLower) ||
      (carga.id_carga?.toString() || '').includes(searchLower)
    );
  });

  // Función para obtener nombre del cliente
  const getClientName = useCallback((clientId) => {
    const client = clients.find(c => c.id_cliente === clientId);
    return client ? (client.empresa || 'Cliente') : 'N/A';
  }, [clients]);

  

  // Función para obtener información del vehículo
  const getVehicleInfo = useCallback((vehicleId) => {
    const vehicle = vehicles.find(v => v.id_vehiculo === vehicleId);
    return vehicle ? (vehicle.placa || vehicle.modelo || 'Vehículo') : 'N/A';
  }, [vehicles]);

  const getClientInfo = useCallback((clientId) => {
    const client = clients.find(d => d.id_cliente === clientId);
    return client ? (client.empresa || 'Cliente') : 'N/A';
  }, [clients]);

  // Función para obtener nombre del conductor
  const getDriverName = useCallback((driverId) => {
    const driver = drivers.find(d => d.id_conductor === driverId);
    return driver;
  }, [drivers]);

  const getDriverInfo = useCallback((vehicleId) => {
    const vehicle = vehicles.find(v => v.id_vehiculo === vehicleId);
    if (vehicle) {
        const driverName = getDriverName(vehicle.id_conductor); // Obtener el nombre del conductor
        return driverName ? (driverName.nombre_conductor || 'Conductor') : 'N/A';
    }
}, [vehicles, getDriverName]);

  // Handlers
  const handleShowDetails = useCallback((carga) => {
  console.log('👁️ Mostrando detalles de la carga:', carga);
  
  if (!carga || !carga.id_carga) {
    console.error('❌ Carga inválida para mostrar detalles');
    showAlert('error', 'Error', 'Carga inválida seleccionada');
    return;
  }
  
  setCurrentCarga(carga);
  setShowCargaModal(true);
}, [showAlert]);

// PASO 10: Modificar  para usar SweetAlert
const handleEditCarga = useCallback((carga) => {
  console.log('✏️ Iniciando edición de la carga:', carga);
  
  if (!carga || !carga.id_carga) {
    console.error('❌ Carga inválida para editar');
    showAlert('error', 'Error', 'Carga inválida para editar');
    return;
  }
  
  setShowCargaModal(false);
  
  setTimeout(() => {
    const editData = {
      id_carga: carga.id_carga,
      descripcion: carga.descripcion || '',
      peso: carga.peso || '',
      foto_carga: carga.foto_carga || '',
      fecha_inicio: carga.fecha_inicio ? carga.fecha_inicio.split('T')[0] : '',
      fecha_fin: carga.fecha_fin ? carga.fecha_fin.split('T')[0] : '',
      vehiculo: carga.vehiculo || '',
      cliente: carga.cliente || ''
    };
    
    console.log('✅ Datos preparados para edición:', editData);
    setEditCarga(editData);
    setShowEditCargaModal(true);
    setEditValidated(false);
  }, 100);
}, [showAlert]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCarga(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditCarga(prev => ({ ...prev, [name]: value }));
  };

  const validateDates = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return false;
    return new Date(fechaInicio) < new Date(fechaFin);
  };

const handleSubmitNewCarga = async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  
  if (form.checkValidity() === false) {
    e.stopPropagation();
    setValidated(true);
    return;
  }
  
  if (!validateDates(newCarga.fecha_inicio, newCarga.fecha_fin)) {
    showAlert('error', 'Error de validación', 'La fecha de inicio debe ser anterior a la fecha de fin');
    return;
  }
  
  try {
    setLoading(true);
    await createNewCarga(newCarga);
    await fetchCargas();
    
    setShowNewCargaModal(false);
    setNewCarga({
      descripcion: '',
      peso: '',
      foto_carga: '',
      fecha_inicio: '',
      fecha_fin: '',
      vehiculo: '',
      cliente: ''
    });
    setValidated(false);
    
    showAlert('success', '¡Carga creada!', 'La carga ha sido registrada correctamente', 2000);
  } catch (error) {
    showAlert('error', 'Error', `Error al crear la carga: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const handleSubmitEditCarga = async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  
  if (form.checkValidity() === false) {
    e.stopPropagation();
    setEditValidated(true);
    return;
  }
  
  if (!validateDates(editCarga.fecha_inicio, editCarga.fecha_fin)) {
    showAlert('error', 'Error de validación', 'La fecha de inicio debe ser anterior a la fecha de fin');
    return;
  }
  
  try {
    setLoading(true);
    const { id_carga, ...cargaData } = editCarga;
    await updateCarga(id_carga, cargaData);
    await fetchCargas();
    
    setShowEditCargaModal(false);
    setEditValidated(false);
    
    showAlert('success', '¡Carga actualizada!', 'Los cambios han sido guardados correctamente', 2000);
  } catch (error) {
    showAlert('error', 'Error', `Error al actualizar la carga: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

const handleDeleteCarga = useCallback(async (cargaId) => {
  const result = await Swal.fire({
    title: '¿Eliminar carga?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#fff',
    color: '#333',
  });

  if (result.isConfirmed) {
    try {
      setLoading(true);
      await deleteCarga(cargaId);
      await fetchCargas();
      
      showAlert('success', '¡Eliminado!', 'La carga ha sido eliminada correctamente', 2000);
    } catch (error) {
      showAlert('error', 'Error', `Error al eliminar la carga: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }
}, [deleteCarga, fetchCargas, showAlert]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <LayoutBarButton userData={userData}>
      <div className="page-header d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Gestión de Cargas</h1>
        <Button 
          variant="warning" 
          className="d-flex align-items-center"
          onClick={() => setShowNewCargaModal(true)}
          disabled={loading}
        >
          <FaPlus className="me-2" /> Nueva Carga
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
                  placeholder="Buscar por descripción, peso o ID de carga"
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
              <FaTruck className="text-warning me-2" size={20} />
              <h5 className="mb-0">Listado de Cargas</h5>
            </div>
            <small className="text-muted">
              {filteredCargas.length} carga(s) encontrada(s)
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
              <Table hover className="cargas-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Peso</th>
                    <th>Fechas</th>
                    <th>Cliente</th>
                    <th>Vehículo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCargas.map((carga) => (
                    <tr key={carga.id_carga}>
                      <td>
                        <Badge bg="secondary">#{carga.id_carga}</Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaBox className="me-2 text-warning" />
                          {carga.descripcion || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaWeight className="me-2 text-muted" />
                          {carga.peso || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div>
                          <small className="text-muted">Inicio:</small>
                          <br />
                          <small>{formatDate(carga.fecha_inicio)}</small>
                          <br />
                          <small className="text-muted">Fin:</small>
                          <br />
                          <small>{formatDate(carga.fecha_fin)}</small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaCar className="me-2 text-muted" />
                          {getClientInfo(carga.cliente)}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaCar className="me-2 text-muted" />
                          {getVehicleInfo(carga.vehiculo)}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaUser className="me-2 text-muted" />
                          {(carga.estado)}
                        </div>
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
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleEditCarga(carga)}
                            disabled={loading}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteCarga(carga.id_carga)}
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
          
          {!loading && filteredCargas.length === 0 && (
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
                  <Badge bg="info" className="mb-2">ID #{currentCarga.id_carga}</Badge>
                  <p className="text-muted">
                    <FaBox className="me-2" />
                    {currentCarga.descripcion}
                  </p>
                  {currentCarga.foto_carga && (
                    <div className="mt-3">
                      <FaImage className="text-warning me-2" />
                      <small>Foto disponible</small>
                    </div>
                  )}
                </Col>
                <Col md={8}>
                  <h5 className="mb-3 mt-4">Información de la Carga</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Peso:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaWeight className="me-2 text-warning" />
                        {currentCarga.peso}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Cliente:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaUserCircle className="me-2 text-warning" />
                        {getClientName(currentCarga.cliente)}
                      </p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Fecha Inicio:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaCalendarAlt className="me-2 text-warning" />
                        {formatDate(currentCarga.fecha_inicio)}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Fecha Fin:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaCalendarAlt className="me-2 text-warning" />
                        {formatDate(currentCarga.fecha_fin)}
                      </p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Asignaciones</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Vehículo:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaCar className="me-2 text-warning" />
                        {getVehicleInfo(currentCarga.vehiculo)}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Estado:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaUser className="me-2 text-warning" />
                        {currentCarga.estado}
                      </p>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCargaModal(false)}>
            Cerrar
          </Button>
          <Button variant="warning" onClick={() => handleEditCarga(currentCarga)}>
            <FaEdit className="me-2" /> Editar Carga
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
              <FaTruck className="me-2 text-warning" />
              Registrar Nueva Carga
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="new-carga-form">
              <h5 className="border-bottom pb-2 mb-3">Información de la Carga</h5>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Descripción *</Form.Label>
                    <Form.Control
                      type="text"
                      name="descripcion"
                      value={newCarga.descripcion}
                      onChange={handleInputChange}
                      required
                      placeholder="Ingrese la descripción de la carga"
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
                    <Form.Label>Peso *</Form.Label>
                    <Form.Control
                      type="text"
                      name="peso"
                      value={newCarga.peso}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: 1500 kg"
                    />
                    <Form.Control.Feedback type="invalid">
                      El peso es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Foto de la Carga</Form.Label>
                    <Form.Control
                      type="text"
                      name="foto_carga"
                      value={newCarga.foto_carga}
                      onChange={handleInputChange}
                      placeholder="URL de la foto (opcional)"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Fechas</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Inicio *</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha_inicio"
                      value={newCarga.fecha_inicio}
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
                    <Form.Label>Fecha de Fin *</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha_fin"
                      value={newCarga.fecha_fin}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      La fecha de fin es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Asignaciones</h5>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cliente *</Form.Label>
                    <Form.Select
                      name="cliente"
                      value={newCarga.cliente}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccione un cliente</option>
                      {clients.map(client => (
                        <option key={client.id_cliente} value={client.id_cliente}>
                          {client.empresa || client.nombre}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Debe seleccionar un cliente
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vehículo</Form.Label>
                    <Form.Select
                      name="vehiculo"
                      value={newCarga.vehiculo}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccione un vehículo</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id_vehiculo} value={vehicle.id_vehiculo}>
                          {vehicle.placa} - {vehicle.modelo}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      name="conductor"
                      value={newCarga.estado}
                      onChange={handleInputChange}
                    >
                      <option value="">Estado</option>
                      {drivers.map(driver => (
                        <option key={driver.id_conductor} value={driver.id_conductor}>
                          {driver.nombre_conductor} {driver.apellido_conductor}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowNewCargaModal(false)}
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
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Guardando...</span>
                  </div>
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Guardar Carga
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal para editar carga */}
      <Modal
        show={showEditCargaModal}
        onHide={() => setShowEditCargaModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Form noValidate validated={editValidated} onSubmit={handleSubmitEditCarga}>
          <Modal.Header closeButton className="border-bottom border-warning">
            <Modal.Title>
              <FaEdit className="me-2 text-warning" />
              Editar Carga
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="edit-carga-form">
              <h5 className="border-bottom pb-2 mb-3">Información de la Carga</h5>
            <div className="new-carga-form">
              </div>
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
                    <Form.Label>Descripción *</Form.Label>
                    <Form.Control
                      type="text"
                      name="descripcion"
                      value={editCarga.descripcion}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Ingrese la descripción de la carga"
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
                    <Form.Label>Peso *</Form.Label>
                    <Form.Control
                      type="text"
                      name="peso"
                      value={editCarga.peso}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Ej: 1500 kg"
                    />
                    <Form.Control.Feedback type="invalid">
                      El peso es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Foto de la Carga</Form.Label>
                    <Form.Control
                      type="text"
                      name="foto_carga"
                      value={editCarga.foto_carga}
                      onChange={handleEditInputChange}
                      placeholder="URL de la foto (opcional)"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Fechas</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Inicio *</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha_inicio"
                      value={editCarga.fecha_inicio}
                      onChange={handleEditInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      La fecha de inicio es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Fin *</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha_fin"
                      value={editCarga.fecha_fin}
                      onChange={handleEditInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      La fecha de fin es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Asignaciones</h5>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cliente *</Form.Label>
                    <Form.Select
                      name="cliente"
                      value={editCarga.cliente}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="">Seleccione un cliente</option>
                      {clients.map(client => (
                        <option key={client.id_cliente} value={client.id_cliente}>
                          {client.empresa || client.nombre}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Debe seleccionar un cliente
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vehículo</Form.Label>
                    <Form.Select
                      name="vehiculo"
                      value={editCarga.vehiculo}
                      onChange={handleEditInputChange}
                    >
                      <option value="">Seleccione un vehículo (opcional)</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id_vehiculo} value={vehicle.id_vehiculo}>
                          {vehicle.placa} - {vehicle.modelo}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Conductor</Form.Label>
                    <Form.Select
                      name="conductor"
                      value={editCarga.conductor}
                      onChange={handleEditInputChange}
                    >
                      <option value="">Seleccione un conductor (opcional)</option>
                      {drivers.map(driver => (
                        <option key={driver.id_conductor} value={driver.id_conductor}>
                          {driver.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowEditCargaModal(false)}
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
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Actualizando...</span>
                  </div>
                  Actualizando...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Actualizar Carga
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </LayoutBarButton>
  );
};

export default Cargas;