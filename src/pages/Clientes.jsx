import { useState, useEffect } from 'react';
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

const Clientes = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentFilter, setDocumentFilter] = useState('Todos');
  const [showClientModal, setShowClientModal] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  
  // Estado para nuevo cliente
  const [newClient, setNewClient] = useState({
    tipo_documento: 'Cédula',
    documento: '',
    nombre_cliente: '',
    apellido_cliente: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    empresa: ''
  });
  
  const [validated, setValidated] = useState(false);

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Función para obtener todos los clientes
  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch('/api/clients', {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener los clientes');
      }

      const data = await response.json();
      setClients(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear un nuevo cliente
  const createNewClient = async (clientData) => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        throw new Error('Error al crear el cliente');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  // Función para eliminar un cliente
  const deleteClient = async (clientId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el cliente');
      }

      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  // useEffect para cargar los clientes al montar el componente
  useEffect(() => {
    fetchClients();
  }, []);

  // Filtrar clientes
  const filteredClients = clients.filter((client) => {
    // Filtrar por término de búsqueda
    const matchesSearch = 
      client.documento?.toString().includes(searchTerm) ||
      client.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.apellido_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.ciudad?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por tipo de documento
    const matchesDocument = 
      documentFilter === 'Todos' || client.tipo_documento === documentFilter;
    
    return matchesSearch && matchesDocument;
  });
  
  // Mostrar detalles del cliente
  const handleShowDetails = (client) => {
    setCurrentClient(client);
    setShowClientModal(true);
  };
  
  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({
      ...newClient,
      [name]: value
    });
  };
  
  // Manejar envío del formulario
  const handleSubmitNewClient = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      setLoading(true);
      await createNewClient(newClient);
      
      // Recargar la lista de clientes
      await fetchClients();
      
      // Cerrar modal y resetear form
      setShowNewClientModal(false);
      setNewClient({
        tipo_documento: 'Cédula',
        documento: '',
        nombre_cliente: '',
        apellido_cliente: '',
        direccion: '',
        ciudad: '',
        telefono: '',
        empresa: ''
      });
      setValidated(false);
      
      alert('Cliente creado exitosamente');
    } catch (error) {
      alert('Error al crear el cliente');
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de cliente
  const handleDeleteClient = async (clientId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
      try {
        setLoading(true);
        await deleteClient(clientId);
        await fetchClients();
        alert('Cliente eliminado exitosamente');
      } catch (error) {
        alert('Error al eliminar el cliente');
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
            <Col md={6} lg={4} className="mt-3 mt-md-0">
              <InputGroup>
                <InputGroup.Text id="filter-addon" className="bg-warning text-white">
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select 
                  value={documentFilter}
                  onChange={(e) => setDocumentFilter(e.target.value)}
                >
                  <option value="Todos">Todos los documentos</option>
                  <option value="Cédula">Cédula</option>
                  <option value="NIT">NIT</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                </Form.Select>
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
                          <small className="text-muted">{client.tipo_documento}</small>
                          <br />
                          <strong>{client.documento}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaUserCircle className="me-2 text-warning" />
                          {client.nombre_cliente} {client.apellido_cliente}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-2 text-muted" />
                          {client.ciudad}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaPhone className="me-2 text-muted" />
                          {client.telefono}
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
                          <Button variant="outline-warning" size="sm" className="me-1">
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
                  <div className="client-avatar mb-3">
                    <FaUserCircle size={100} className="text-warning" />
                  </div>
                  <h4>{currentClient.nombre_cliente} {currentClient.apellido_cliente}</h4>
                  <p className="mb-1">
                    <Badge bg="info">{currentClient.tipo_documento}</Badge>
                  </p>
                  <p className="text-muted">
                    <FaIdCard className="me-2" />
                    {currentClient.documento}
                  </p>
                </Col>
                <Col md={8}>
                  <h5 className="mb-3">Información Personal</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Nombre:</strong></p>
                      <p>{currentClient.nombre_cliente}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Apellido:</strong></p>
                      <p>{currentClient.apellido_cliente}</p>
                    </Col>
                  </Row>
                  
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
          <Button variant="warning">
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
              {/* Información del documento */}
              <h5 className="border-bottom pb-2 mb-3">Información de Identificación</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Documento</Form.Label>
                    <Form.Select
                      name="tipo_documento"
                      value={newClient.tipo_documento}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Cédula">Cédula</option>
                      <option value="NIT">NIT</option>
                      <option value="Pasaporte">Pasaporte</option>
                      <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Número de Documento</Form.Label>
                    <Form.Control
                      type="text"
                      name="documento"
                      value={newClient.documento}
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
              
              {/* Información personal */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información Personal</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre_cliente"
                      value={newClient.nombre_cliente}
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
                      name="apellido_cliente"
                      value={newClient.apellido_cliente}
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
              
              {/* Información de contacto */}
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
              
              {/* Información empresarial */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información Empresarial</h5>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Empresa (Opcional)</Form.Label>
                    <Form.Control
                      type="text"
                      name="empresa"
                      value={newClient.empresa}
                      onChange={handleInputChange}
                      placeholder="Ingrese el nombre de la empresa (opcional)"
                    />
                    <Form.Text className="text-muted">
                      Este campo es opcional
                    </Form.Text>
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
    </LayoutBarButton>
  );
};

export default Clientes;