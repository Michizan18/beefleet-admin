import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { 
  FaMoneyBillWave, 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaSave,
  FaCalendar,
  FaDollarSign,
  FaFileImage,
  FaBoxes,
  FaComments
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import './Gastos.css';

// Componente para el badge de tipo de gasto
const TipoBadge = ({ tipo }) => {
  const getBadgeColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'combustible':
        return 'warning';
      case 'mantenimiento':
        return 'info';
      case 'peajes':
        return 'secondary';
      case 'hospedaje':
        return 'primary';
      case 'alimentacion':
        return 'success';
      case 'otros':
        return 'dark';
      default:
        return 'secondary';
    }
  };

  return (
    <span className={`badge bg-${getBadgeColor(tipo)} rounded-pill`}>
      {tipo}
    </span>
  );
};

const Gastos = () => {
  // Estados
  const [gastos, setGastos] = useState([]);
  const [filteredGastos, setFilteredGastos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('Todos');
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [showNewGastoModal, setShowNewGastoModal] = useState(false);
  const [currentGasto, setCurrentGasto] = useState(null);
  const [validated, setValidated] = useState(false);

  // Estado para nuevo gasto
  const [newGasto, setNewGasto] = useState({
    fecha: '',
    valor: '',
    tipo: '',
    descripcion: '',
    foto: '',
    carga: ''
  });

  // Datos de ejemplo
  const gastosEjemplo = [
    {
      id_gasto: 1,
      fecha: '2024-01-15',
      valor: '$150,000',
      tipo: 'Combustible',
      descripcion: 'Tanqueada completa en estación Shell',
      foto: 'combustible_001.jpg',
      carga: 'CARGA-001'
    },
    {
      id_gasto: 2,
      fecha: '2024-01-16',
      valor: '$25,000',
      tipo: 'Peajes',
      descripcion: 'Peajes ruta Bogotá-Medellín',
      foto: 'peaje_001.jpg',
      carga: 'CARGA-002'
    },
    {
      id_gasto: 3,
      fecha: '2024-01-17',
      valor: '$80,000',
      tipo: 'Alimentacion',
      descripcion: 'Almuerzo y cena conductor',
      foto: '',
      carga: 'CARGA-001'
    },
    {
      id_gasto: 4,
      fecha: '2024-01-18',
      valor: '$200,000',
      tipo: 'Mantenimiento',
      descripcion: 'Cambio de aceite y filtros',
      foto: 'mantenimiento_001.jpg',
      carga: ''
    }
  ];

  // Efectos
  useEffect(() => {
    setGastos(gastosEjemplo);
    setFilteredGastos(gastosEjemplo);
  }, []);

  useEffect(() => {
    let filtered = gastos;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(gasto =>
        gasto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.carga.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (tipoFilter !== 'Todos') {
      filtered = filtered.filter(gasto => gasto.tipo === tipoFilter);
    }

    setFilteredGastos(filtered);
  }, [searchTerm, tipoFilter, gastos]);

  // Handlers
  const handleShowDetails = (gasto) => {
    setCurrentGasto(gasto);
    setShowGastoModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGasto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitNewGasto = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Generar ID automático
    const nuevoId = Math.max(...gastos.map(g => g.id_gasto)) + 1;
    
    const nuevoGasto = {
      ...newGasto,
      id_gasto: nuevoId,
      valor: `$${newGasto.valor.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
    };

    setGastos([...gastos, nuevoGasto]);
    setNewGasto({
      fecha: '',
      valor: '',
      tipo: '',
      descripcion: '',
      foto: '',
      carga: ''
    });
    setValidated(false);
    setShowNewGastoModal(false);
  };

  return (
    <LayoutBarButton>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title mb-0">Gestión de Gastos</h2>
        </div>
        <Button 
          variant="warning" 
          onClick={() => setShowNewGastoModal(true)}
          className="btn-add-fixed"
          style={{
            backgroundColor: '#ff8c00',
            borderColor: '#ff8c00',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#ff8c00';
            e.target.style.borderColor = '#ff8c00';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#ff8c00';
            e.target.style.borderColor = '#ff8c00';
          }}
        >
          <FaPlus className="me-2" />
          Nuevo Gasto
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={6} lg={8}>
              <InputGroup>
                <InputGroup.Text id="search-addon" className="bg-warning text-white">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por descripción, carga o tipo"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-describedby="search-addon"
                />
              </InputGroup>
            </Col>
            <Col md={6} lg={4} className="mt-3 mt-md-0">
              <InputGroup>
                <InputGroup.Text id="filter-addon" className="bg-warning text-white">
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select 
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Combustible">Combustible</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Peajes">Peajes</option>
                  <option value="Hospedaje">Hospedaje</option>
                  <option value="Alimentacion">Alimentación</option>
                  <option value="Otros">Otros</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Listado de gastos */}
      <Card>
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaMoneyBillWave className="text-warning me-2" size={20} />
              <h5 className="mb-0">Listado de Gastos</h5>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="gastos-table">
              <thead>
                <tr>
                  <th style={{ fontWeight: '700' }}>Fecha</th>
                  <th style={{ fontWeight: '700' }}>Valor</th>
                  <th style={{ fontWeight: '700' }}>Tipo</th>
                  <th style={{ fontWeight: '700' }}>Descripción</th>
                  <th style={{ fontWeight: '700' }}>Carga</th>
                  <th style={{ fontWeight: '700' }}>Foto</th>
                  <th style={{ fontWeight: '700' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredGastos.map((gasto) => (
                  <tr key={gasto.id_gasto}>
                    <td style={{ fontWeight: '700' }}>
                      <span className="text-success">{gasto.valor}</span>
                      <div className="d-flex align-items-center">
                        <FaCalendar className="me-2 text-warning" />
                        {gasto.fecha}
                      </div>
                    </td>
                    <td>
                      <span className="text-success">{gasto.valor}</span>
                    </td>
                    <td>
                      <TipoBadge tipo={gasto.tipo} />
                    </td>
                    <td>
                      <div className="descripcion-cell">
                        {gasto.descripcion}
                      </div>
                    </td>
                    <td>
                      {gasto.carga ? (
                        <div className="d-flex align-items-center">
                          <FaBoxes className="me-2 text-warning" />
                          {gasto.carga}
                        </div>
                      ) : (
                        <span className="text-muted">Sin asignar</span>
                      )}
                    </td>
                    <td>
                      {gasto.foto ? (
                        <FaFileImage className="text-info" />
                      ) : (
                        <span className="text-muted">Sin foto</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleShowDetails(gasto)}
                        >
                          Ver
                        </Button>
                        <Button variant="outline-warning" size="sm" className="me-1">
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          style={{
                            color: '#dc3545',
                            borderColor: '#dc3545'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#dc3545';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#dc3545';
                          }}
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
          
          {filteredGastos.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron gastos con los criterios de búsqueda.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de detalles del gasto */}
      <Modal 
        show={showGastoModal} 
        onHide={() => setShowGastoModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>Detalles del Gasto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentGasto && (
            <div className="gasto-detail">
              <Row>
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <div className="gasto-avatar mb-3">
                    <FaMoneyBillWave size={100} className="text-warning" />
                  </div>
                  <h4>#{currentGasto.id_gasto}</h4>
                  <p className="mb-1">
                    <TipoBadge tipo={currentGasto.tipo} />
                  </p>
                  <p className="text-success">
                    <strong>{currentGasto.valor}</strong>
                  </p>
                </Col>
                <Col md={8}>
                  <h5 className="mb-3">Información del Gasto</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Fecha:</strong></p>
                      <p>
                        <FaCalendar className="me-2 text-warning" />
                        {currentGasto.fecha}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Tipo:</strong></p>
                      <p>
                        <TipoBadge tipo={currentGasto.tipo} />
                      </p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={12}>
                      <p className="mb-1"><strong>Descripción:</strong></p>
                      <p>
                        <FaComments className="me-2 text-warning" />
                        {currentGasto.descripcion}
                      </p>
                    </Col>
                  </Row>
                  
                  {currentGasto.carga && (
                    <Row className="mb-3">
                      <Col sm={12}>
                        <p className="mb-1"><strong>Carga Asociada:</strong></p>
                        <p>
                          <FaBoxes className="me-2 text-warning" />
                          {currentGasto.carga}
                        </p>
                      </Col>
                    </Row>
                  )}
                  
                  {currentGasto.foto && (
                    <Row className="mb-3">
                      <Col sm={12}>
                        <p className="mb-1"><strong>Evidencia Fotográfica:</strong></p>
                        <p>
                          <FaFileImage className="me-2 text-info" />
                          {currentGasto.foto}
                        </p>
                      </Col>
                    </Row>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGastoModal(false)}>
            Cerrar
          </Button>
          <Button variant="warning">
            <FaEdit className="me-2" /> Editar Gasto
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para crear nuevo gasto */}
      <Modal
        show={showNewGastoModal}
        onHide={() => setShowNewGastoModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Form noValidate validated={validated} onSubmit={handleSubmitNewGasto}>
          <Modal.Header closeButton className="border-bottom border-warning">
            <Modal.Title>
              <FaMoneyBillWave className="me-2 text-warning" />
              Registrar Nuevo Gasto
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="new-gasto-form">
              <h5 className="border-bottom pb-2 mb-3">Información del Gasto</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha *</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha"
                      value={newGasto.fecha}
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
                    <Form.Label>Valor *</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="valor"
                        value={newGasto.valor}
                        onChange={handleInputChange}
                        required
                        placeholder="150,000"
                      />
                      <Form.Control.Feedback type="invalid">
                        El valor es obligatorio
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo *</Form.Label>
                    <Form.Select
                      name="tipo"
                      value={newGasto.tipo}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="Combustible">Combustible</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="Peajes">Peajes</option>
                      <option value="Hospedaje">Hospedaje</option>
                      <option value="Alimentacion">Alimentación</option>
                      <option value="Otros">Otros</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      El tipo es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Carga Asociada</Form.Label>
                    <Form.Control
                      type="text"
                      name="carga"
                      value={newGasto.carga}
                      onChange={handleInputChange}
                      placeholder="CARGA-001 (opcional)"
                    />
                    <Form.Text className="text-muted">
                      Opcional - asociar gasto a una carga específica
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Descripción *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="descripcion"
                      value={newGasto.descripcion}
                      onChange={handleInputChange}
                      required
                      placeholder="Descripción detallada del gasto"
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
                    <Form.Label>Foto/Evidencia</Form.Label>
                    <Form.Control
                      type="file"
                      name="foto"
                      onChange={handleInputChange}
                      accept="image/*"
                    />
                    <Form.Text className="text-muted">
                      Opcional - adjuntar evidencia fotográfica (factura, recibo, etc.)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewGastoModal(false)}>
              Cancelar
            </Button>
            <Button variant="warning" type="submit">
              <FaSave className="me-2" /> Guardar Gasto
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </LayoutBarButton>
  );
};

export default Gastos;