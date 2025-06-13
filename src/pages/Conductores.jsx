import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { 
  FaIdCard,  
  FaUserCircle, 
  FaSearch, FaUsers, 
  FaEdit, FaTrashAlt, FaPlus, FaSave,
  FaPhone, FaMapMarkerAlt, FaEnvelope,
  FaCarSide, FaCamera, FaUser
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';

// Constantes para tipos de documento
const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PA', label: 'Pasaporte' }
];

// Constantes para mensajes de validación
const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es obligatorio',
  EMAIL_FORMAT: 'El email debe tener un formato válido',
  PHONE_FORMAT: 'El teléfono debe tener un formato válido',
  DOCUMENT_UNIQUE: 'Ya existe un conductor con este documento'
};

const Conductores = () => {
  // Estados principales
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  
  // Estados para modales
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showNewDriverModal, setShowNewDriverModal] = useState(false);
  const [showEditDriverModal, setShowEditDriverModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Estados para conductores
  const [currentDriver, setCurrentDriver] = useState(null);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [newDriver, setNewDriver] = useState({
    tipo_documento: 'CC',
    documento: '',
    nombre_conductor: '',
    apellido_conductor: '',
    correo_conductor: '',
    foto: '',
    telefono: '',
    ciudad: '',
    direccion: ''
  });
  
  const [editDriver, setEditDriver] = useState({
    id_conductor: '',
    tipo_documento: 'CC',
    documento: '',
    nombre_conductor: '',
    apellido_conductor: '',
    correo_conductor: '',
    foto: '',
    telefono: '',
    ciudad: '',
    direccion: ''
  });
  
  // Estados de validación
  const [validated, setValidated] = useState(false);
  const [editValidated, setEditValidated] = useState(false);

  //Estados de imagenes
  // Agregar después de los estados existentes
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');

  // Función para obtener el token de autenticación
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('token');
    console.log(token ? `Bearer ${token}` : "XXXX")
    return token ? `Bearer ${token}` : null;
  }, []);

  // Función para procesar la respuesta de MySQL
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
      
      // Validar y normalizar cada conductor
      const validDrivers = processedData.filter(item => {
        const hasValidId = item && (item.id_conductor || item.id);
        const hasDocument = item && item.documento;
        
        if (!hasValidId || !hasDocument) {
          console.warn('⚠️ Conductor inválido filtrado:', item);
          return false;
        }
        
        // Normalizar campos
        item.id_conductor = item.id_conductor || item.id;
        item.tipo_documento = item.tipo_documento || 'CC';
        item.documento = item.documento || '';
        item.nombre_conductor = item.nombre_conductor || '';
        item.apellido_conductor = item.apellido_conductor || '';
        item.correo_conductor = item.correo_conductor || '';
        item.foto = item.foto || '';
        item.telefono = item.telefono || '';
        item.ciudad = item.ciudad || '';
        item.direccion = item.direccion || '';
        
        return true;
      });
      
      console.log('✅ Conductores procesados:', validDrivers.length);
      return validDrivers;
      
    } catch (error) {
      console.error('❌ Error procesando respuesta MySQL:', error);
      return [];
    }
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
      const processedData = processMySQLResponse(data);
      
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
  }, [getAuthToken, processMySQLResponse]);

  // Función para generar contraseña automática
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Agregar esta función después de generatePassword
  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) {
        setEditImageFile(file);
        setEditImagePreview(URL.createObjectURL(file));
      } else {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  // Función para enviar contraseña por email
  const sendPasswordByEmail = useCallback(async (email, password) => {
    try {
      const response = await fetch('http://localhost:3001/api/send-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          correo_conductor: email,
          contraseña: password
        })
      });

      if (!response.ok) {
        throw new Error('Error al enviar el email');
      }

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }, []);

  // Función para crear un nuevo conductor
  const createNewDriver = useCallback(async (driverData) => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3001/api/drivers', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(driverData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al crear el conductor');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  }, [getAuthToken]);

  // Función para editar un conductor
  const updateDriver = useCallback(async (driverId, driverData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:3001/api/drivers/${driverId}`, {
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
      console.error('Error updating driver:', error);
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

  // Helper functions
  const checkDocumentExists = useCallback((documento) => {
    return drivers.some(driver => driver.documento === documento);
  }, [drivers]);

  // Efecto para cargar conductores al montar el componente
  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

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
  
  // Handlers
  const handleShowDetails = useCallback((driver) => {
    console.log('👁️ Mostrando detalles del conductor:', driver);
    
    if (!driver || (!driver.id_conductor && !driver.id)) {
      console.error('❌ Conductor inválido para mostrar detalles');
      setError('Conductor inválido seleccionado');
      return;
    }
    
    const driverToShow = drivers.find(d => 
      (d.id_conductor === driver.id_conductor || d.id === driver.id_conductor) ||
      (d.id_conductor === driver.id || d.id === driver.id) ||
      d.documento === driver.documento
    ) || driver;
    
    const validatedDriver = {
      id_conductor: driverToShow.id_conductor || driverToShow.id,
      tipo_documento: driverToShow.tipo_documento || 'CC',
      documento: driverToShow.documento || 'N/A',
      nombre_conductor: driverToShow.nombre_conductor || 'Sin nombre',
      apellido_conductor: driverToShow.apellido_conductor || 'Sin apellido',
      correo_conductor: driverToShow.correo_conductor || 'Sin email',
      foto: driverToShow.foto || '',
      telefono: driverToShow.telefono || 'Sin teléfono',
      ciudad: driverToShow.ciudad || 'Sin ciudad',
      direccion: driverToShow.direccion || 'Sin dirección'
    };
    
    console.log('✅ Conductor validado para mostrar:', validatedDriver);
    setCurrentDriver(validatedDriver);
    setShowDriverModal(true);
    setError(null);
  }, [drivers]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDriver(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditDriver(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitNewDriver = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    if (checkDocumentExists(newDriver.documento)) {
      setError(`Ya existe un conductor con el documento: ${newDriver.documento}`);
      return;
    }
    
    try {
      setLoading(true);
      
      // Generar contraseña automática
      const generatedPassword = generatePassword();
      
      // Crear el conductor
      await createNewDriver(newDriver);
      
      // Enviar contraseña por email si hay correo
      if (newDriver.correo_conductor) {
        try {
          await sendPasswordByEmail(newDriver.correo_conductor, generatedPassword);
          console.log('✅ Contraseña enviada por email');
        } catch (emailError) {
          console.warn('⚠️ Error enviando email, pero conductor creado:', emailError);
        }
      }
      
      await fetchDrivers();
      
      setShowNewDriverModal(false);
      setNewDriver({
        tipo_documento: 'CC',
        documento: '',
        nombre_conductor: '',
        apellido_conductor: '',
        correo_conductor: '',
        foto: '',
        telefono: '',
        ciudad: '',
        direccion: ''
      });
      setValidated(false);
      setError(null);
    } catch (error) {
      setError(`Error al crear el conductor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      setError(`Error al actualizar el conductor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDriver = useCallback(async (driver) => {
    console.log('✏️ Iniciando edición del conductor:', driver);
    
    if (!driver || (!driver.id_conductor && !driver.id)) {
      console.error('❌ Conductor inválido para editar');
      setError('Conductor inválido para editar');
      return;
    }
    
    setShowDriverModal(false);
    
    const driverId = driver.id_conductor || driver.id;
    const currentDriverInState = drivers.find(d => 
      d.id_conductor === driverId || d.id === driverId || d.documento === driver.documento
    );
    
    const driverToEdit = currentDriverInState || driver;
    
    setTimeout(() => {
      const editData = {
        id_conductor: driverToEdit.id_conductor || driverToEdit.id,
        tipo_documento: driverToEdit.tipo_documento || 'CC',
        documento: driverToEdit.documento || '',
        nombre_conductor: driverToEdit.nombre_conductor || '',
        apellido_conductor: driverToEdit.apellido_conductor || '',
        correo_conductor: driverToEdit.correo_conductor || '',
        foto: driverToEdit.foto || '',
        telefono: driverToEdit.telefono || '',
        ciudad: driverToEdit.ciudad || '',
        direccion: driverToEdit.direccion || ''
      };
      
      console.log('✅ Datos preparados para edición:', editData);
      setEditDriver(editData);
      setShowEditDriverModal(true);
      setEditValidated(false);
      setError(null);
    }, 100);
  }, [drivers]);

  const handleDeleteDriver = useCallback((driverId) => {
    const driver = drivers.find(d => d.id_conductor === driverId);
    if (driver) {
      setDriverToDelete(driver);
      setShowDeleteModal(true);
    }
  }, [drivers]);

  const confirmDeleteDriver = async () => {
    if (!driverToDelete) return;
    
    try {
      setLoading(true);
      await deleteDriver(driverToDelete.id_conductor);
      await fetchDrivers();
      setShowDeleteModal(false);
      setDriverToDelete(null);
      setError(null);
    } catch (error) {
      setError(`Error al eliminar el conductor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
                  placeholder="Buscar por documento, nombre, apellido, ciudad o email"
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
                    <th>Ciudad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id_conductor}>
                      <td>
                        <div>
                          <small className="text-muted">{driver.tipo_documento}</small>
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
                          {driver.ciudad || 'Sin ciudad'}
                        </div>
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
          <Modal.Title>Detalles del Conductor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentDriver && (
            <div className="driver-detail">
              <Row>
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <div className="mb-3">
                    {currentDriver.foto ? (
                      <img 
                        src={currentDriver.foto} 
                        alt="Foto del conductor" 
                        className="rounded-circle"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                        style={{ width: '100px', height: '100px' }}
                      >
                        <FaCamera className="text-muted" size={30} />
                      </div>
                    )}
                  </div>
                  <p className="mb-1">
                    <Badge bg="info">{currentDriver.tipo_documento}</Badge>
                  </p>
                  <p className="text-muted">
                    <FaIdCard className="me-2" />
                    {currentDriver.documento}
                  </p>
                </Col>
                <Col md={8}>
                  <h5 className="mb-3">Información Personal</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Nombre:</strong></p>
                      <p>{currentDriver.nombre_conductor}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Apellido:</strong></p>
                      <p>{currentDriver.apellido_conductor}</p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Información de Contacto</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Email:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaEnvelope className="me-2 text-warning" />
                        {currentDriver.correo_conductor}
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
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Ciudad:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaMapMarkerAlt className="me-2 text-warning" />
                        {currentDriver.ciudad}
                      </p>
                    </Col>
                    <Col sm={12}>
                      <p className="mb-1"><strong>Dirección:</strong></p>
                      <p>{currentDriver.direccion}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDriverModal(false)}>
            Cerrar
          </Button>
          <Button variant="warning" onClick={() => handleEditDriver(currentDriver)}>
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
                      El apellido es obligatorio</Form.Control.Feedback>
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
                    <Form.Label>Ciudad</Form.Label>
                    <Form.Control
                      type="text"
                      name="ciudad"
                      value={newDriver.ciudad}
                      onChange={handleInputChange}
                      required
                      placeholder="Ciudad de residencia"
                    />
                    <Form.Control.Feedback type="invalid">
                      La ciudad es obligatoria
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
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Guardando...</span>
                  </div>
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
        onHide={() => setShowEditDriverModal(false)}
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
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Número de Documento</Form.Label>
                    <Form.Control
                      type="text"
                      name="documento"
                      value={editDriver.documento}
                      onChange={handleEditInputChange}
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
                    <Form.Label>Ciudad</Form.Label>
                    <Form.Control
                      type="text"
                      name="ciudad"
                      value={editDriver.ciudad}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Ciudad de residencia"
                    />
                    <Form.Control.Feedback type="invalid">
                      La ciudad es obligatoria
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
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Actualizando...</span>
                  </div>
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
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Eliminando...</span>
                </div>
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
    </LayoutBarButton>
  );
};

export default Conductores;