import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { 
  FaSearch, FaCalendarAlt, FaFileInvoiceDollar,
  FaEdit, FaTrashAlt, FaPlus, FaSave
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';

const Ventas = () => {
  // Estados
  const [userData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [sales, setSales] = useState([]);
  const [cargas, setCargas] = useState([]);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);

  // Estado para nueva venta
  const [newSale, setNewSale] = useState({
    fecha: new Date().toISOString().split('T')[0],
    valor: '',
    descripcion: '',
    carga: ''
  });

  // Obtener token de autenticación
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      throw new Error('No hay token de autenticación');
    }
    return token;
  }, []);

  // Función para hacer peticiones autenticadas
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    const token = getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error en petición a ${url}:`, error);
      throw error;
    }
  }, [getAuthToken]);

  // Obtener ventas
  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await makeAuthenticatedRequest('/api/sales');
      setSales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError(`Error al cargar ventas: ${error.message}`);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [makeAuthenticatedRequest]);

  // Obtener cargas
  const fetchCargas = useCallback(async () => {
    try {
      const data = await makeAuthenticatedRequest('/api/loads');
      setCargas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching cargas:', error);
      setError(`Error al cargar cargas: ${error.message}`);
      setCargas([]);
    }
  }, [makeAuthenticatedRequest]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchSales();
    fetchCargas();
  }, [fetchSales, fetchCargas]);

  // Filtrar ventas
  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.valor?.toString().includes(searchTerm) ||
      sale.id_venta?.toString().includes(searchTerm);
    
    const matchesDate = dateFilter === '' || (sale.fecha && sale.fecha.includes(dateFilter));
    
    return matchesSearch && matchesDate;
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSale(prev => ({ ...prev, [name]: value }));
  };

  // Crear nueva venta
  const handleSubmitNewSale = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      await makeAuthenticatedRequest('/api/sales', {
        method: 'POST',
        body: JSON.stringify(newSale)
      });
      
      await fetchSales();
      setShowNewSaleModal(false);
      setNewSale({
        fecha: new Date().toISOString().split('T')[0],
        valor: '',
        descripcion: '',
        carga: ''
      });
      setValidated(false);
      setError('');
    } catch (error) {
      console.error('Error creating sale:', error);
      setError(`Error al crear venta: ${error.message}`);
    }
  };

  // Eliminar venta
  const handleDeleteSale = async (saleId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
      try {
        await makeAuthenticatedRequest(`/api/sales/${saleId}`, {
          method: 'DELETE'
        });
        await fetchSales();
        setError('');
      } catch (error) {
        console.error('Error deleting sale:', error);
        setError(`Error al eliminar venta: ${error.message}`);
      }
    }
  };

  // Formateadores
  const formatCurrency = (value) => 
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO', {
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
      
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      
      {/* Filtros y búsqueda */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6} lg={6}>
              <InputGroup>
                <InputGroup.Text className="bg-warning text-white">
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
                <InputGroup.Text className="bg-warning text-white">
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
                  {filteredSales.map((sale) => (
                    <tr key={sale.id_venta}>
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
                        <div className="d-flex gap-1">
                          <Button 
                            variant="outline-warning" 
                            size="sm"
                            onClick={() => handleShowDetails(sale)}
                          >
                            Ver
                          </Button>
                          <Button variant="outline-warning" size="sm">
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
          
          {!loading && filteredSales.length === 0 && !error && (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron ventas con los criterios de búsqueda.</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal de detalles */}
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
                  <FaFileInvoiceDollar size={100} className="text-warning mb-3" />
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
                      <p><strong>Descripción:</strong> {currentSale.descripcion}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p><strong>Fecha:</strong> {formatDate(currentSale.fecha)}</p>
                    </Col>
                    <Col sm={6}>
                      <p><strong>Valor:</strong> <span className="text-success fw-bold">
                        {formatCurrency(currentSale.valor)}
                      </span></p>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={12}>
                      <p><strong>Carga Asociada:</strong> {' '}
                        <Badge bg="info" className="rounded-pill">
                          Carga #{currentSale.carga}
                        </Badge>
                      </p>
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
            <FaEdit className="me-2" /> Editar
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para nueva venta */}
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
            
            <Form.Group className="mb-3">
              <Form.Label>Carga Asociada</Form.Label>
              <Form.Select
                name="carga"
                value={newSale.carga}
                onChange={handleInputChange}
                required={cargas.length > 0}
              >
                <option value="">
                  {cargas.length > 0 ? 'Seleccionar carga...' : 'No hay cargas disponibles'}
                </option>
                {cargas.map((carga) => (
                  <option key={carga.id_carga} value={carga.id_carga}>
                    Carga #{carga.id_carga} - {carga.descripcion || 'Sin descripción'}
                  </option>
                ))}
              </Form.Select>
              {cargas.length > 0 && (
                <Form.Control.Feedback type="invalid">
                  Seleccione una carga
                </Form.Control.Feedback>
              )}
            </Form.Group>
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