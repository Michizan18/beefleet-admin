import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Dropdown, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaCheckCircle,
  FaUser,
  FaReceipt,  
  FaUserCircle, 
  FaSearch, FaFilter, FaDollarSign, 
  FaEdit, FaTrashAlt, FaPlus, FaSave,
  FaCalendarAlt, FaFileInvoiceDollar
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
  const [showEditSaleModal, setShowEditSaleModal] = useState(false);
  const [showDeleteModal ,setShowDeleteModal] = useState(false);
  const [saleToDelete ,setSaleToDelete] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successSubMessage, setSuccessSubMessage] = useState('');
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  // Estado para nueva venta
  const [newSale, setNewSale] = useState({
    valor: 0,
    carga: 0
  });

  const [validated, setValidated] = useState(false);
   const [editSale, setEditSale] = useState({
        id_venta: '',
        valor: 0,
        carga: 0
    });
    // Función para abrir el modal de edición
  const handleEditSale = (sale) => {
      setEditSale({
          id_venta: sale.id_venta,
          valor: sale.valor,
          carga: sale.carga
      });
      setShowEditSaleModal(true);
  };

  // Manejar cambios en el formulario de edición
  const handleEditInputChange = (e) => {
      const { name, value } = e.target;
      setEditSale({
          ...editSale,
          [name]: value
      });
  };

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


  // Filtrar ventas
  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
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

const handleSubmitEditSale = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`http://localhost:3001/api/sales/${editSale.id_venta}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(editSale)
        });
        if (response.ok) {
            await fetchData(); // Recargar ventas
            setShowEditSaleModal(false); // Cerrar modal
            setEditSale({ valor: 0, carga: 0, fecha: '' }); // Resetear estado
        } else {
            const errorData = await response.json();
            setError(errorData.message || 'Error al editar la venta');
        }
    } catch (error) {
        console.error('Error editing sale:', error);
        setError(`Error al editar venta: ${error.message}`);
    }
};
const handleDeleteSale = useCallback((saleId) => {
    const sale = sales.find(d => d.id_venta === saleId);
    if (sale) {
      setSaleToDelete(sale);
      setShowDeleteModal(true);
    }
  }, [sales]);

  const confirmDeleteSale = async () => {
  if (!saleToDelete) return;
  
  try {
    setLoading(true);
    await deleteSale(saleToDelete.id_venta);
    await fetchData();
    setShowDeleteModal(false);
    setSaleToDelete(null);
    setError(null);
    
    // Mostrar modal de éxito para eliminación
    setSuccessMessage('¡Venta eliminada exitosamente!');
    setSuccessSubMessage('La venta ha sido removida del sistema');
    setShowDeleteSuccessModal(true);

    // Ocultar modal después de 2 segundos
    setTimeout(() => setShowDeleteSuccessModal(false), 2000);
    
  } catch (error) {
    setError(`Error al eliminar venta: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

 const deleteSale = useCallback(async (saleId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:3001/api/sales/${saleId}`, {
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
  
  // Formatear valor monetario
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
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
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleEditSale(sale)}
                          >
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
          <Button 
            variant="outline-warning" 
            size="sm" 
            className="me-1"
            onClick={() => handleEditSale(currentSale)}
          >
            <FaEdit className="me-2" /> Editar Información
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar venta */}
<Modal
    show={showEditSaleModal}
    onHide={() => setShowEditSaleModal(false)}
    size="lg"
    centered
>
    <Form noValidate onSubmit={handleSubmitEditSale}>
        <Modal.Header closeButton className="border-bottom border-warning">
            <Modal.Title>
                <FaFileInvoiceDollar className="me-2 text-warning" />
                Editar Venta #{editSale.id_venta}
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Valor</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>$</InputGroup.Text>
                            <Form.Control
                                type="number"
                                name="valor"
                                value={editSale.valor}
                                onChange={handleEditInputChange}
                                required
                                min="0"
                                step="1000"
                            />
                        </InputGroup>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Carga Asociada</Form.Label>
                        <Form.Select
                            name="carga"
                            value={editSale.carga}
                            onChange={handleEditInputChange}
                            required
                        >
                            <option value="">Seleccionar carga...</option>
                            {cargas.map((carga) => (
                                <option key={carga.id_carga} value={carga.id_carga}>
                                    Carga #{carga.id_carga} - {carga.descripcion || 'Sin descripción'}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditSaleModal(false)}>
                Cancelar
            </Button>
            <Button variant="warning" type="submit">
                <FaSave className="me-2" /> Guardar Cambios
            </Button>
        </Modal.Footer>
    </Form>
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
                {saleToDelete && (
                  <div className="text-center">
                    <div className="mb-3">
                      <FaUser size={40} className="text-danger" />
                    </div>
                    <p className="mb-3">
                      ¿Está seguro que desea eliminar la venta?
                    </p>
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
                  onClick={confirmDeleteSale}
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

export default Ventas;