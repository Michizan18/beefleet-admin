import { useState, useEffect } from 'react';
import { Card, Table, Button, Dropdown, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaBoxes, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard, FaBell, 
  FaUserPlus, FaUserCircle, FaCog, FaSignOutAlt, FaChartLine, 
  FaClipboardList, FaCalendarAlt, FaSearch, FaFilter, FaCarAlt, 
  FaEdit, FaTrashAlt, FaPlus, FaSave, FaComments, FaTruck, FaBuilding,
  FaWeightHanging, FaRoute, FaCalendar
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import './Cargas.css';

const Cargas = () => {
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
    destino: '',
    origen: '',
    vehiculo: '',
    conductor: '',
    fechaInicio: '',
    fechaFin: '',
    estado: 'Pendiente',
    valor: '',
    observaciones: '',
    telefono: '',
    direccionDestino: '',
    direccionOrigen: ''
  });
  
  const [validated, setValidated] = useState(false);

  const cargas = [
    {
      id: 1,
      referencia: 'CARGA-001',
      descripcion: 'Transporte de materiales de construcción',
      peso: '2.5 ton',
      cliente: 'Empresa A',
      destino: 'Ciudad X',
      origen: 'Bogotá',
      vehiculo: 'ABC-123',
      conductor: 'Luis Martínez',
      fechaInicio: '2025-05-23',
      fechaFin: '2025-05-24',
      estado: 'En tránsito',
      valor: '$500,000',
      observaciones: 'Carga frágil - manejar con cuidado',
      telefono: '3001234567',
      direccionDestino: 'Calle 45 #12-34, Ciudad X',
      direccionOrigen: 'Carrera 30 #45-67, Bogotá'
    },
    {
      id: 2,
      referencia: 'CARGA-002',
      descripcion: 'Electrodomésticos varios',
      peso: '1.8 ton',
      cliente: 'Empresa B',
      destino: 'Medellín',
      origen: 'Bogotá',
      vehiculo: 'XYZ-789',
      conductor: 'Pablo Cárdenas',
      fechaInicio: '2025-05-24',
      fechaFin: '2025-05-25',
      estado: 'Pendiente',
      valor: '$350,000',
      observaciones: 'Entrega en horario de oficina',
      telefono: '3007654321',
      direccionDestino: 'Avenida 80 #23-45, Medellín',
      direccionOrigen: 'Zona Industrial, Bogotá'
    },
    {
      id: 3,
      referencia: 'CARGA-003',
      descripcion: 'Productos alimenticios refrigerados',
      peso: '3.2 ton',
      cliente: 'Empresa C',
      destino: 'Cali',
      origen: 'Bogotá',
      vehiculo: 'DEF-456',
      conductor: 'Ana López',
      fechaInicio: '2025-05-22',
      fechaFin: '2025-05-23',
      estado: 'Entregado',
      valor: '$750,000',
      observaciones: 'Cadena de frío requerida',
      telefono: '3009876543',
      direccionDestino: 'Centro Comercial, Cali',
      direccionOrigen: 'Frigorífico Central, Bogotá'
    },
    {
      id: 4,
      referencia: 'CARGA-004',
      descripción: 'Muebles de oficina',
      peso: '1.2 ton',
      cliente: 'Empresa D',
      destino: 'Barranquilla',
      origen: 'Bogotá',
      vehiculo: 'Sin asignar',
      conductor: 'Sin asignar',
      fechaInicio: '2025-05-25',
      fechaFin: '2025-05-26',
      estado: 'Programado',
      valor: '$400,000',
      observaciones: 'Requiere servicio de montaje',
      telefono: '3005432109',
      direccionDestino: 'Edificio Torre Norte, Barranquilla',
      direccionOrigen: 'Fábrica de Muebles, Bogotá'
    }
  ];

  const filteredCargas = cargas.filter((carga) => {
    // Filtrar por término de búsqueda
    const matchesSearch = 
      carga.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carga.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carga.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (carga.conductor && carga.conductor.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtrar por estado
    const matchesStatus = 
      statusFilter === 'Todos' || carga.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Mostrar detalles de la carga
  const handleShowDetails = (carga) => {
    setCurrentCarga(carga);
    setShowCargaModal(true);
  };
  
  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCarga({
      ...newCarga,
      [name]: value
    });
  };
  
  // Generar referencia automática
  const generateReference = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CARGA-${year}${month}${day}-${random}`;
  };
  
  // Manejar envío del formulario
  const handleSubmitNewCarga = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Generar referencia si no se ha proporcionado
    if (!newCarga.referencia) {
      setNewCarga(prev => ({
        ...prev,
        referencia: generateReference()
      }));
    }
    
    // Aquí iría la lógica para guardar la nueva carga
    console.log('Nueva carga:', newCarga);
    
    // Cerrar modal y resetear form
    setShowNewCargaModal(false);
    setNewCarga({
      referencia: '',
      descripcion: '',
      peso: '',
      cliente: '',
      destino: '',
      origen: '',
      vehiculo: '',
      conductor: '',
      fechaInicio: '',
      fechaFin: '',
      estado: 'Pendiente',
      valor: '',
      observaciones: '',
      telefono: '',
      direccionDestino: '',
      direccionOrigen: ''
    });
    setValidated(false);
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
  
  return (
    <LayoutBarButton userData={userData}>
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
            <Col md={6} lg={4} className="mt-3 mt-md-0">
              <InputGroup>
                <InputGroup.Text id="filter-addon" className="bg-warning text-white">
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Programado">Programado</option>
                  <option value="En tránsito">En tránsito</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </Form.Select>
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
                  <h5 className="mb-3">Información de la Carga</h5>
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