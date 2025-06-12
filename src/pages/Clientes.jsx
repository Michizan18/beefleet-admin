import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Dropdown, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaIdCard,  
  FaUserCircle, 
  FaSearch, FaFilter, FaUsers, 
  FaEdit, FaTrashAlt, FaPlus, FaSave,
  FaBuilding, FaPhone, FaMapMarkerAlt
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';

// Constantes para mensajes de validación
const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es obligatorio',
  NIT_FORMAT: 'El NIT debe tener un formato válido',
  PHONE_FORMAT: 'El teléfono debe tener un formato válido'
};

const Clientes = () => {
  // Estados principales
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  
  // Estados para modales
  const [showClientModal, setShowClientModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  
  // Estados para clientes
  const [currentClient, setCurrentClient] = useState(null);
  const [newClient, setNewClient] = useState({
    nit: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    empresa: '',
    email: '',
    nombre: ''
  });
  
  const [editClient, setEditClient] = useState({
    id_cliente: '',
    nit: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    empresa: '',
    email: '',
    nombre: ''
  });
  
  // Estados de validación
  const [validated, setValidated] = useState(false);
  const [editValidated, setEditValidated] = useState(false);

  // Función para obtener el token de autenticación
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
  }, []);

  // Función mejorada para procesar la respuesta de MySQL
  const processMySQLResponse = useCallback((rawData) => {
    try {
      if (!rawData) return [];
      
      if (Array.isArray(rawData)) {
        // Si es un array de arrays (resultado directo de MySQL)
        if (rawData.length > 0 && Array.isArray(rawData[0])) {
          return rawData[0].filter(item => item?.id_cliente);
        }
        // Si es un array simple de objetos cliente
        return rawData.filter(item => item?.id_cliente);
      }
      
      // Si es un solo objeto cliente
      if (rawData?.id_cliente) {
        return [rawData];
      }
      
      return [];
    } catch (error) {
      console.error('Error processing MySQL response:', error);
      return [];
    }
  }, []);

  // Función para obtener todos los clientes
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:3001/api/clients', {
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
        throw new Error(errorText || 'Error al obtener los clientes');
      }

      const data = await response.json();
      const processedData = processMySQLResponse(data);
      
      if (!processedData.length) {
        setError('No se encontraron clientes');
      }
      
      setClients(processedData);
      
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError(`Error al cargar los clientes: ${error.message}`);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, processMySQLResponse]);

  // Función para crear un nuevo cliente
  const createNewClient = useCallback(async (clientData) => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3001/api/clients', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al crear el cliente');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }, [getAuthToken]);

  // Función para editar un cliente
  const updateClient = useCallback(async (clientId, clientData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:3001/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al actualizar el cliente');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }, [getAuthToken]);

  // Función para eliminar un cliente
  const deleteClient = useCallback(async (clientId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:3001/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al eliminar el cliente');
      }

      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }, [getAuthToken]);

  // Helper functions
  const checkNitExists = useCallback((nit) => {
    return clients.some(client => client.nit === nit);
  }, [clients]);

  // Efecto para cargar clientes al montar el componente
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Filtrar clientes
  const filteredClients = clients.filter((client) => {
    if (!client?.id_cliente) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (client.nit?.toString() || '').toLowerCase().includes(searchLower) ||
      (client.empresa?.toLowerCase() || '').includes(searchLower) ||
      (client.ciudad?.toLowerCase() || '').includes(searchLower) ||
      (client.nombre?.toLowerCase() || '').includes(searchLower)
    );
  });
  
  // Handlers
  const handleShowDetails = (client) => {
    setCurrentClient(client);
    setShowClientModal(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditClient(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitNewClient = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    if (checkNitExists(newClient.nit)) {
      setError(`Ya existe un cliente con el NIT: ${newClient.nit}`);
      return;
    }
    
    try {
      setLoading(true);
      await createNewClient(newClient);
      await fetchClients();
      
      setShowNewClientModal(false);
      setNewClient({
        nit: '',
        direccion: '',
        ciudad: '',
        telefono: '',
        empresa: '',
        email: '',
        nombre: ''
      });
      setValidated(false);
      setError(null);
    } catch (error) {
      setError(`Error al crear el cliente: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEditClient = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setEditValidated(true);
      return;
    }
    
    try {
      setLoading(true);
      const { id_cliente, ...clientData } = editClient;
      await updateClient(id_cliente, clientData);
      await fetchClients();
      
      setShowEditClientModal(false);
      setEditValidated(false);
      setError(null);
    } catch (error) {
      setError(`Error al actualizar el cliente: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = (client) => {
    setShowClientModal(false);
    
    setTimeout(() => {
      setEditClient({
        id_cliente: client.id_cliente,
        nit: client.nit || '',
        ciudad: client.ciudad || '',
        nombre: client.nombre || '',
        telefono: client.telefono || '',
        direccion: client.direccion || '',
        email: client.email || '',
        empresa: client.empresa || ''
      });
      setShowEditClientModal(true);
    }, 100);
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
      try {
        setLoading(true);
        await deleteClient(clientId);
        await fetchClients();
        setError(null);
      } catch (error) {
        setError(`Error al eliminar el cliente: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <LayoutBarButton userData={userData}>
      <div className="page-header d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Gestión de Clientes</h1>
        <Button 
          variant="warning" 
          className="d-flex align-items-center"
          onClick={() => setShowNewClientModal(true)}
          disabled={loading}
        >
          <FaPlus className="me-2" /> Nuevo Cliente
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
                  placeholder="Buscar por documento, nombre, empresa o ciudad"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Listado de clientes */}
      <Card>
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaUsers className="text-warning me-2" size={20} />
              <h5 className="mb-0">Listado de Clientes</h5>
            </div>
            <small className="text-muted">
              {filteredClients.length} cliente(s) encontrado(s)
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
              <Table hover className="clientes-table">
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Nombre Completo</th>
                    <th>Ciudad</th>
                    <th>Teléfono</th>
                    <th>Empresa</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id_cliente}>
                      <td>
                        <div>
                          <small className="text-muted">NIT</small>
                          <br />
                          <strong>{client.nit || 'N/A'}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaUserCircle className="me-2 text-warning" />
                          {client.empresa || 'Sin empresa'}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-2 text-muted" />
                          {client.ciudad || 'Sin ciudad'}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaPhone className="me-2 text-muted" />
                          {client.telefono || 'Sin teléfono'}
                        </div>
                      </td>
                      <td>
                        {client.empresa ? (
                          <div className="d-flex align-items-center">
                            <FaBuilding className="me-2 text-muted" />
                            {client.empresa}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleShowDetails(client)}
                          >
                            Ver
                          </Button>
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleEditClient(client)}
                            disabled={loading}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteClient(client.id_cliente)}
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
          
          {!loading && filteredClients.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron clientes con los criterios de búsqueda.</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal de detalles del cliente */}
      <Modal 
        show={showClientModal} 
        onHide={() => setShowClientModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>Detalles del Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentClient && (
            <div className="client-detail">
              <Row>
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <p className="mb-1">
                    <Badge bg="info">NIT</Badge>
                  </p>
                  <p className="text-muted">
                    <FaIdCard className="me-2" />
                    {currentClient.nit}
                  </p>
                </Col>
                <Col md={8}>
                  <h5 className="mb-3 mt-4">Información de Contacto</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Teléfono:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaPhone className="me-2 text-warning" />
                        {currentClient.telefono}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Ciudad:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaMapMarkerAlt className="me-2 text-warning" />
                        {currentClient.ciudad}
                      </p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={12}>
                      <p className="mb-1"><strong>Dirección:</strong></p>
                      <p>{currentClient.direccion}</p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Información Empresarial</h5>
                  <Row className="mb-3">
                    <Col sm={12}>
                      <p className="mb-1"><strong>Empresa:</strong></p>
                      {currentClient.empresa ? (
                        <p className="d-flex align-items-center">
                          <FaBuilding className="me-2 text-warning" />
                          {currentClient.empresa}
                        </p>
                      ) : (
                        <p className="text-muted">No especificada</p>
                      )}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClientModal(false)}>
            Cerrar
          </Button>
          <Button variant="warning" onClick={() => handleEditClient(currentClient)}>
            <FaEdit className="me-2" /> Editar Información
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para crear nuevo cliente */}
      <Modal
        show={showNewClientModal}
        onHide={() => setShowNewClientModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Form noValidate validated={validated} onSubmit={handleSubmitNewClient}>
          <Modal.Header closeButton className="border-bottom border-warning">
            <Modal.Title>
              <FaUsers className="me-2 text-warning" />
              Registrar Nuevo Cliente
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="new-client-form">
              <h5 className="border-bottom pb-2 mb-3">Información de Identificación</h5>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>NIT</Form.Label>
                    <Form.Control
                      type="text"
                      name="nit"
                      value={newClient.nit}
                      onChange={handleInputChange}
                      required
                      placeholder="Ingrese el NIT"
                    />
                    <Form.Control.Feedback type="invalid">
                      El NIT es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Contacto</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="tel"
                      name="telefono"
                      value={newClient.telefono}
                      onChange={handleInputChange}
                      required
                      placeholder="Ingrese el teléfono"
                    />
                    <Form.Control.Feedback type="invalid">
                      El teléfono es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ciudad</Form.Label>
                    <Form.Control
                      type="text"
                      name="ciudad"
                      value={newClient.ciudad}
                      onChange={handleInputChange}
                      required
                      placeholder="Ingrese la ciudad"
                    />
                    <Form.Control.Feedback type="invalid">
                      La ciudad es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                      type="text"
                      name="direccion"
                      value={newClient.direccion}
                      onChange={handleInputChange}
                      required
                      placeholder="Ingrese la dirección completa"
                    />
                    <Form.Control.Feedback type="invalid">
                      La dirección es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información Empresarial</h5>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Empresa</Form.Label>
                    <Form.Control
                      type="text"
                      name="empresa"
                      value={newClient.empresa}
                      onChange={handleInputChange}
                      placeholder="Ingrese el nombre de la empresa o del cliente"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowNewClientModal(false)}
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
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="me-2" /> Guardar Cliente
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* Modal para editar cliente */}
    <Modal
      show={showEditClientModal}
      onHide={() => setShowEditClientModal(false)}
      size="lg"
      centered
      backdrop="static"
    >
      <Form noValidate validated={editValidated} onSubmit={handleSubmitEditClient}>
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>
            <FaEdit className="me-2 text-warning" />
            Editar Cliente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="edit-client-form">
            <h5 className="border-bottom pb-2 mb-3">Información de Identificación</h5>
            <Row className="mb-3">
              <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>NIT (ID único - No editable)</Form.Label>
                <Form.Control
                  type="text"
                  name="nit"
                  value={editClient.nit}
                  readOnly
                  className="bg-light"
                  style={{ cursor: 'not-allowed' }}
                />
                <Form.Text className="text-muted">
                  El NIT es el identificador único del cliente y no puede ser modificado
                </Form.Text>
              </Form.Group>
              </Col>
            </Row>
            
            <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Contacto</h5>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefono"
                    value={editClient.telefono}
                    onChange={handleEditInputChange}
                    required
                    placeholder="Ingrese el teléfono"
                  />
                  <Form.Control.Feedback type="invalid">
                    El teléfono es obligatorio
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control
                    type="text"
                    name="ciudad"
                    value={editClient.ciudad}
                    onChange={handleEditInputChange}
                    required
                    placeholder="Ingrese la ciudad"
                  />
                  <Form.Control.Feedback type="invalid">
                    La ciudad es obligatoria
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    name="direccion"
                    value={editClient.direccion}
                    onChange={handleEditInputChange}
                    required
                    placeholder="Ingrese la dirección completa"
                  />
                  <Form.Control.Feedback type="invalid">
                    La dirección es obligatoria
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <h5 className="border-bottom pb-2 mb-3 mt-4">Información Empresarial</h5>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Empresa</Form.Label>
                  <Form.Control
                    type="text"
                    name="empresa"
                    value={editClient.empresa}
                    onChange={handleEditInputChange}
                    placeholder="Ingrese el nombre de la empresa o del cliente"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowEditClientModal(false)}
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
                  <span className="visually-hidden">Loading...</span>
                </div>
                Actualizando...
              </>
            ) : (
              <>
                <FaSave className="me-2" /> Actualizar Cliente
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
    </LayoutBarButton>
  );
};
export const clientUtils = {
  findClientByNit: (clients, nit) => clients.find(client => client.nit === nit),
  getClientNitsList: (clients) => clients.map(client => ({
    nit: client.nit,
    empresa: client.empresa,
    displayText: `${client.nit} - ${client.empresa || 'Sin empresa'}`
  })),
  checkNitExists: (clients, nit) => clients.some(client => client.nit === nit)
};

export default Clientes;