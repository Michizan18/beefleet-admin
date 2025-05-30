import { useState, useEffect } from 'react';
import { Card, Table, Button, Dropdown, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaBoxes, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard, FaBell, 
  FaUserPlus, FaUserCircle, FaCog, FaSignOutAlt, FaChartLine, 
  FaClipboardList, FaCalendarAlt, FaSearch, FaFilter, FaCarAlt, 
  FaEdit, FaTrashAlt, FaPlus, FaSave, FaComments, FaTruck, FaBuilding,
  FaWeightHanging, FaRoute, FaCalendar, FaDollarSign, FaFileInvoiceDollar,
  FaShoppingCart
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import './Ventas.css';

const Ventas = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showVentaModal, setShowVentaModal] = useState(false);
  const [currentVenta, setCurrentVenta] = useState(null);
  const [showNewVentaModal, setShowNewVentaModal] = useState(false);
  
  // Estado para nueva venta
  const [newVenta, setNewVenta] = useState({
    referencia: '',
    descripcion: '',
    valor: '',
    cliente: '',
    fecha: '',
    carga: '',
    estado: 'Pendiente',
    observaciones: '',
    telefono: '',
    email: '',
    direccion: '',
    metodoPago: '',
    descuento: '',
    impuestos: ''
  });
  
  const [validated, setValidated] = useState(false);

  const ventas = [
    {
      id: 1,
      referencia: 'VENTA-001',
      descripcion: 'Venta de productos electrónicos',
      valor: '$850,000',
      cliente: 'Empresa A',
      fecha: '14/01/2025',
      carga: 'CARGA-001',
      estado: 'Completada',
      observaciones: 'Pago en efectivo',
      telefono: '3001234567',
      email: 'contacto@empresaa.com',
      direccion: 'Calle 45 #12-34, Ciudad X',
      metodoPago: 'Efectivo',
      descuento: '0%',
      impuestos: '19%'
    },
    {
      id: 2,
      referencia: 'VENTA-002',
      descripcion: 'Venta de materiales de construcción',
      valor: '$650,000',
      cliente: 'Empresa B',
      fecha: '19/01/2025',
      carga: 'CARGA-002',
      estado: 'Pendiente',
      observaciones: 'Pago a 30 días',
      telefono: '3007654321',
      email: 'ventas@empresab.com',
      direccion: 'Avenida 80 #23-45, Medellín',
      metodoPago: 'Crédito',
      descuento: '5%',
      impuestos: '19%'
    },
    {
      id: 3,
      referencia: 'VENTA-003',
      descripcion: 'Venta de productos alimenticios',
      valor: '$1,200,000',
      cliente: 'Empresa C',
      fecha: '21/01/2025',
      carga: 'CARGA-003',
      estado: 'Completada',
      observaciones: 'Pago por transferencia',
      telefono: '3009876543',
      email: 'compras@empresac.com',
      direccion: 'Centro Comercial, Cali',
      metodoPago: 'Transferencia',
      descuento: '10%',
      impuestos: '19%'
    },
    {
      id: 4,
      referencia: 'VENTA-004',
      descripcion: 'Venta de equipos industriales',
      valor: '$750,000',
      cliente: 'Empresa D',
      fecha: '24/01/2025',
      carga: 'CARGA-004',
      estado: 'Facturada',
      observaciones: 'Pago contra entrega',
      telefono: '3005432109',
      email: 'logistica@empresad.com',
      direccion: 'Edificio Torre Norte, Barranquilla',
      metodoPago: 'Contra entrega',
      descuento: '0%',
      impuestos: '19%'
    }
  ];

  const filteredVentas = ventas.filter((venta) => {
    // Filtrar por término de búsqueda
    const matchesSearch = 
      venta.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.carga.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por estado
    const matchesStatus = 
      statusFilter === 'Todos' || venta.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Mostrar detalles de la venta
  const handleShowDetails = (venta) => {
    setCurrentVenta(venta);
    setShowVentaModal(true);
  };
  
  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVenta({
      ...newVenta,
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
    return `VENTA-${year}${month}${day}-${random}`;
  };
  
  // Manejar envío del formulario
  const handleSubmitNewVenta = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Generar referencia si no se ha proporcionado
    if (!newVenta.referencia) {
      setNewVenta(prev => ({
        ...prev,
        referencia: generateReference()
      }));
    }
    
    // Aquí iría la lógica para guardar la nueva venta
    console.log('Nueva venta:', newVenta);
    
    // Cerrar modal y resetear form
    setShowNewVentaModal(false);
    setNewVenta({
      referencia: '',
      descripcion: '',
      valor: '',
      cliente: '',
      fecha: '',
      carga: '',
      estado: 'Pendiente',
      observaciones: '',
      telefono: '',
      email: '',
      direccion: '',
      metodoPago: '',
      descuento: '',
      impuestos: ''
    });
    setValidated(false);
  };
  
  // Componente para el badge de estado
  const EstadoBadge = ({ estado }) => {
    let variant;
    switch (estado) {
      case 'Completada':
        variant = 'success';
        break;
      case 'Pendiente':
        variant = 'warning';
        break;
      case 'Facturada':
        variant = 'info';
        break;
      case 'Cancelada':
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
        <h1>Gestión de Ventas</h1>
        <Button 
          variant="warning" 
          className="d-flex align-items-center"
          onClick={() => setShowNewVentaModal(true)}
        >
          <FaPlus className="me-2" /> Nueva Venta
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
                  placeholder="Buscar por referencia, descripción o carga"
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
                  <option value="Facturada">Facturada</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Listado de ventas */}
      <Card>
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaFileInvoiceDollar className="text-warning me-2" size={20} />
              <h5 className="mb-0">Listado de Ventas</h5>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="ventas-table">
              <thead>
                <tr>
                  <th>Referencia</th>
                  <th>Fecha</th>
                  <th>Valor</th>
                  <th>Descripción</th>
                  <th>Carga</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVentas.map((venta, index) => (
                  <tr key={index}>
                    <td>
                      <div>
                        <strong>{venta.referencia}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaCalendar className="me-2 text-warning" />
                        {venta.fecha}
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong className="text-success">{venta.valor}</strong>
                      </div>
                    </td>
                    <td>
                      <div>
                        {venta.descripcion}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaBoxes className="me-2 text-warning" />
                        {venta.carga}
                      </div>
                    </td>
                    <td>
                      <EstadoBadge estado={venta.estado} />
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleShowDetails(venta)}
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
          
          {filteredVentas.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron ventas con los criterios de búsqueda.</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal de detalles de la venta */}
      <Modal 
        show={showVentaModal} 
        onHide={() => setShowVentaModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>Detalles de la Venta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentVenta && (
            <div className="venta-detail">
              <Row>
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <div className="venta-avatar mb-3">
                    <FaFileInvoiceDollar size={100} className="text-warning" />
                  </div>
                  <h4>{currentVenta.referencia}</h4>
                  <p className="mb-1">
                    <EstadoBadge estado={currentVenta.estado} />
                  </p>
                  <p className="text-success">
                    <strong>{currentVenta.valor}</strong>
                  </p>
                </Col>
                <Col md={8}>
                  <h5 className="mb-3">Información de la Venta</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Cliente:</strong></p>
                      <p>
                        <FaBuilding className="me-2 text-warning" />
                        {currentVenta.cliente}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Descripción:</strong></p>
                      <p>{currentVenta.descripcion}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Fecha:</strong></p>
                      <p>
                        <FaCalendar className="me-2" />
                        {currentVenta.fecha}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Carga Asociada:</strong></p>
                      <p>
                        <FaBoxes className="me-2" />
                        {currentVenta.carga}
                      </p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Información de Contacto</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Teléfono:</strong></p>
                      <p>
                        <FaPhone className="me-2" />
                        {currentVenta.telefono}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Email:</strong></p>
                      <p>
                        <FaEnvelope className="me-2" />
                        {currentVenta.email}
                      </p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={12}>
                      <p className="mb-1"><strong>Dirección:</strong></p>
                      <p>
                        <FaMapMarkerAlt className="me-2 text-danger" />
                        {currentVenta.direccion}
                      </p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Información de Pago</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Método de Pago:</strong></p>
                      <p>
                        <FaDollarSign className="me-2" />
                        {currentVenta.metodoPago}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Descuento:</strong></p>
                      <p>{currentVenta.descuento}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Impuestos:</strong></p>
                      <p>{currentVenta.impuestos}</p>
                    </Col>
                  </Row>
                  
                  {currentVenta.observaciones && (
                    <>
                      <h5 className="mb-3 mt-4">Observaciones</h5>
                      <p className="text-muted">{currentVenta.observaciones}</p>
                    </>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVentaModal(false)}>
            Cerrar
          </Button>
          <Button variant="warning">
            <FaEdit className="me-2" />
            Editar
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para nueva venta */}
      <Modal 
        show={showNewVentaModal} 
        onHide={() => setShowNewVentaModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>Nueva Venta</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmitNewVenta}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Referencia</Form.Label>
                  <Form.Control
                    type="text"
                    name="referencia"
                    value={newVenta.referencia}
                    onChange={handleInputChange}
                    placeholder="Se generará automáticamente"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cliente *</Form.Label>
                  <Form.Control
                    type="text"
                    name="cliente"
                    value={newVenta.cliente}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingrese el cliente.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Descripción *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="descripcion"
                    value={newVenta.descripcion}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingrese la descripción.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor *</Form.Label>
                  <Form.Control
                    type="text"
                    name="valor"
                    value={newVenta.valor}
                    onChange={handleInputChange}
                    placeholder="$0"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingrese el valor.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha *</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha"
                    value={newVenta.fecha}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor seleccione la fecha.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Carga Asociada</Form.Label>
                  <Form.Control
                    type="text"
                    name="carga"
                    value={newVenta.carga}
                    onChange={handleInputChange}
                    placeholder="CARGA-XXX"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="estado"
                    value={newVenta.estado}
                    onChange={handleInputChange}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Facturada">Facturada</option>
                    <option value="Completada">Completada</option>
                    <option value="Cancelada">Cancelada</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefono"
                    value={newVenta.telefono}
                    onChange={handleInputChange}
                    placeholder="300 123 4567"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={newVenta.email}
                    onChange={handleInputChange}
                    placeholder="cliente@empresa.com"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Método de Pago</Form.Label>
                  <Form.Select
                    name="metodoPago"
                    value={newVenta.metodoPago}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Crédito">Crédito</option>
                    <option value="Contra entrega">Contra entrega</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Descuento (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="descuento"
                    value={newVenta.descuento}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    name="direccion"
                    value={newVenta.direccion}
                    onChange={handleInputChange}
                    placeholder="Dirección completa"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Observaciones</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="observaciones"
                    value={newVenta.observaciones}
                    onChange={handleInputChange}
                    placeholder="Observaciones adicionales..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewVentaModal(false)}>
              Cancelar
            </Button>
            <Button variant="warning" type="submit">
              <FaSave className="me-2" />
              Guardar Venta
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </LayoutBarButton>
  );
};

export default Ventas;