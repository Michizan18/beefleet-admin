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
  const [error, setError] = useState('');
  
  // Estado para nueva venta
  const [newSale, setNewSale] = useState({
    valor: 0,
    carga: 0
  });

  const [validated, setValidated] = useState(false);

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    console.log('Token obtenido:', token);
    return token;
  };
  

  // Obtener ventas de la base de datos
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }
      // Obtener token del localStorage si existe
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      };
      
      // Agregar Authorization header si hay token
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch vehículos y conductores en paralelo
      const [salesResponse, loadsResponse] = await Promise.all([
        fetch('http://localhost:3001/api/sales/', {
          method: 'GET',
          headers,
        }),
        fetch('http://localhost:3001/api/loads/', {
          method: 'GET',
          headers,
        }).catch(error => {
          console.warn('No se pudieron cargar las ventas:', error);
          return { ok: false };
        })
      ]);

      if (!loadsResponse.ok) {
        throw new Error(`Error al cargar las cargas: ${loadsResponse.status}`);
      }

      const salesData = await salesResponse.json();
      console.log('Datos de Ventas:', salesData);
      setSales(salesData);

      // Cargar conductores si la respuesta es exitosa
      if (loadsResponse.ok) {
        const loadsData = await loadsResponse.json();
        console.log('Datos de Cargas:', loadsData);
        setCargas(loadsData);
      } else {
        // Datos de conductores hardcodeados como fallback
        setCargas([]);
      }

    } catch (error) {
      console.error("Error al cargar datos:", error.message);
      alert(`Error al cargar los datos: ${error.message}`);
      
      // En caso de error, usar datos de ejemplo para conductores
      setCargas([
      ]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);


  const filteredSales = sales.filter((sale) => {
    // Filtrar por término de búsqueda
    const matchesSearch = 
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
      const response = await fetch('http://localhost:3001/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Asegúrate de incluir el token
        },
        body: JSON.stringify({
          valor: newSale.valor,
          carga: newSale.carga
        }) // Asegúrate de que esto esté correctamente formateado
      });
      
      if (response.ok) {
        // Recargar ventas
        await fetchData();
        
        // Cerrar modal y resetear form
        setShowNewSaleModal(false);
        setNewSale({
          valor: '',
          carga: ''
        });
        setValidated(false);
        setError('');
      } else {
        const errorData = await response.json(); // Obtener el cuerpo de la respuesta
        setError(errorData.message || 'Error al crear la venta');
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      setError(`Error al crear venta: ${error.message}`);
    }
};


  // Eliminar venta
  const handleDeleteSale = async (saleId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/sales${saleId}`, {
          method: 'DELETE'
        });
        
        if (response && response.ok) {
          await fetchData();
          setError('');
        } else {
          setError('Error al eliminar la venta');
        }
      } catch (error) {
        console.error('Error deleting sale:', error);
        setError(`Error al eliminar venta: ${error.message}`);
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
      
      {/* Mostrar errores si los hay */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
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
          
          {!loading && filteredSales.length === 0 && !error && (
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
                    <Form.Label>Carga Asociada</Form.Label>
                    <Form.Select
                      name="carga"
                      value={newSale.carga}
                      onChange={handleInputChange}
                      required={cargas.length > 0} // Solo requerido si hay cargas disponibles
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
                    {cargas.length === 0 && (
                      <Form.Text className="text-warning">
                        No se pudieron cargar las cargas disponibles
                      </Form.Text>
                    )}
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