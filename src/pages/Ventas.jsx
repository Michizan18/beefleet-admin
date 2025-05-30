import { useState, useEffect } from 'react';
import { Card, Table, Button, Dropdown, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaReceipt,  
  FaUserCircle, 
  FaSearch, FaFilter, FaDollarSign, 
  FaEdit, FaTrashAlt, FaPlus, FaSave,
  FaCalendarAlt, FaFileInvoiceDollar
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';

const Ventas = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [sales, setSales] = useState([]);
  const [cargas, setCargas] = useState([]);
  
  // Estado para nueva venta
  const [newSale, setNewSale] = useState({
    fecha: new Date().toISOString().split('T')[0],
    valor: '',
    descripcion: '',
    carga: ''
  });
  
  const [validated, setValidated] = useState(false);

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Función para hacer peticiones autenticadas
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    return response;
  };

  // Obtener ventas de la base de datos
  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('/api/sales');
      if (response && response.ok) {
        const data = await response.json();
        setSales(data);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener cargas para el dropdown
  const fetchCargas = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/loads');
      if (response && response.ok) {
        const data = await response.json();
        setCargas(data);
      }
    } catch (error) {
      console.error('Error fetching cargas:', error);
    }
  };

  // useEffect para cargar datos al montar el componente
  useEffect(() => {
    fetchSales();
    fetchCargas();
  }, []);

  const filteredSales = sales.filter((sale) => {
    // Filtrar por término de búsqueda
    const matchesSearch = 
      sale.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.valor?.toString().includes(searchTerm) ||
      sale.id_venta?.toString().includes(searchTerm);
    
    // Filtrar por fecha
    const matchesDate = 
      dateFilter === '' || 
      (sale.fecha && sale.fecha.includes(dateFilter));
    
    return matchesSearch && matchesDate;
  });
  
  // Mostrar detalles de la venta
  const handleShowDetails = (sale) => {
    setCurrentSale(sale);
    setShowSaleModal(true);
  };
  
  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSale({
      ...newSale,
      [name]: value
    });
  };
  
  // Manejar envío del formulario
  const handleSubmitNewSale = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      const response = await makeAuthenticatedRequest('/api/sales', {
        method: 'POST',
        body: JSON.stringify(newSale)
      });
      
      if (response && response.ok) {
        // Recargar ventas
        await fetchSales();
        
        // Cerrar modal y resetear form
        setShowNewSaleModal(false);
        setNewSale({
          fecha: new Date().toISOString().split('T')[0],
          valor: '',
          descripcion: '',
          carga: ''
        });
        setValidated(false);
      } else {
        console.error('Error creating sale');
      }
    } catch (error) {
      console.error('Error creating sale:', error);
    }
  };

  // Eliminar venta
  const handleDeleteSale = async (saleId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
      try {
        const response = await makeAuthenticatedRequest(`/api/sales/${saleId}`, {
          method: 'DELETE'
        });
        
        if (response && response.ok) {
          await fetchSales();
        } else {
          console.error('Error deleting sale');
        }
      } catch (error) {
        console.error('Error deleting sale:', error);
      }
    }
  };
  
  // Formatear valor monetario
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <LayoutBarButton userData={userData}>
      <div className="page-header d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Gestión de Ventas</h1>
        <Button 
          variant="warning" 
          className="d-flex align-items-center"
          onClick={() => setShowNewSaleModal(true)}
        >
          <FaPlus className="me-2" /> Nueva Venta
        </Button>
      </div>
      
      {/* Filtros y búsqueda */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6} lg={6}>
              <InputGroup>
                <InputGroup.Text id="basic-addon1" className="bg-warning text-white">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por descripción, valor o ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} lg={6} className="mt-3 mt-md-0">
              <InputGroup>
                <InputGroup.Text id="filter-addon" className="bg-warning text-white">
                  <FaCalendarAlt />
                </InputGroup.Text>
                <Form.Control
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
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
            <span className="text-muted">Total: {filteredSales.length} ventas</span>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <p>Cargando ventas...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ventas-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Valor</th>
                    <th>Descripción</th>
                    <th>Carga</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale, index) => (
                    <tr key={sale.id_venta || index}>
                      <td>#{sale.id_venta}</td>
                      <td>{formatDate(sale.fecha)}</td>
                      <td className="fw-bold text-success">
                        {formatCurrency(sale.valor)}
                      </td>
                      <td>{sale.descripcion}</td>
                      <td>
                        <Badge bg="info" className="rounded-pill">
                          Carga #{sale.carga}
                        </Badge>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleShowDetails(sale)}
                          >
                            Ver
                          </Button>
                          <Button variant="outline-warning" size="sm" className="me-1">
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteSale(sale.id_venta)}
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
          
          {!loading && filteredSales.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron ventas con los criterios de búsqueda.</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal de detalles de la venta */}
      <Modal 
        show={showSaleModal} 
        onHide={() => setShowSaleModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>Detalles de la Venta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentSale && (
            <div className="sale-detail">
              <Row>
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <div className="sale-avatar mb-3">
                    <FaFileInvoiceDollar size={100} className="text-warning" />
                  </div>
                  <h4>Venta #{currentSale.id_venta}</h4>
                  <p className="mb-1 h5 text-success">
                    {formatCurrency(currentSale.valor)}
                  </p>
                  <p className="text-muted">
                    <FaCalendarAlt className="me-2" />
                    {formatDate(currentSale.fecha)}
                  </p>
                </Col>
                <Col md={8}>
                  <h5 className="mb-3">Información de la Venta</h5>
                  <Row className="mb-3">
                    <Col sm={12}>
                      <p className="mb-1"><strong>Descripción:</strong></p>
                      <p>{currentSale.descripcion}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Fecha:</strong></p>
                      <p>{formatDate(currentSale.fecha)}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Valor:</strong></p>
                      <p className="text-success fw-bold">{formatCurrency(currentSale.valor)}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={12}>
                      <p className="mb-1"><strong>Carga Asociada:</strong></p>
                      <Badge bg="info" className="rounded-pill">
                        Carga #{currentSale.carga}
                      </Badge>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaleModal(false)}>
            Cerrar
          </Button>
          <Button variant="warning">
            <FaEdit className="me-2" /> Editar Información
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para crear nueva venta */}
      <Modal
        show={showNewSaleModal}
        onHide={() => setShowNewSaleModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Form noValidate validated={validated} onSubmit={handleSubmitNewSale}>
          <Modal.Header closeButton className="border-bottom border-warning">
            <Modal.Title>
              <FaFileInvoiceDollar className="me-2 text-warning" />
              Registrar Nueva Venta
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="new-sale-form">
              {/* Información de la venta */}
              <h5 className="border-bottom pb-2 mb-3">Información de la Venta</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha"
                      value={newSale.fecha}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      La fecha es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Valor</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="valor"
                        value={newSale.valor}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="1000"
                      />
                      <Form.Control.Feedback type="invalid">
                        El valor es obligatorio
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="descripcion"
                      value={newSale.descripcion}
                      onChange={handleInputChange}
                      required
                      placeholder="Descripción detallada de la venta"
                    />
                    <Form.Control.Feedback type="invalid">
                      La descripción es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Carga Asociada</Form.Label>
                    <Form.Select
                      name="carga"
                      value={newSale.carga}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar carga...</option>
                      {cargas.map((carga) => (
                        <option key={carga.id_carga} value={carga.id_carga}>
                          Carga #{carga.id_carga} - {carga.descripcion || 'Sin descripción'}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Seleccione una carga
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewSaleModal(false)}>
              Cancelar
            </Button>
            <Button variant="warning" type="submit">
              <FaSave className="me-2" /> Guardar Venta
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </LayoutBarButton>
  );
};

export default Ventas;