import { useState, useEffect } from 'react';
import { Card, Table, Button, Dropdown, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaIdCard,  
  FaUserCircle, 
  FaSearch, FaFilter, FaCarAlt, 
  FaEdit, FaTrashAlt, FaPlus, FaSave,
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';

const Vehiculos = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [showNewVehicleModal, setShowNewVehicleModal] = useState(false);
  
  // Estado para nuevo vehículo
  const [newVehicle, setNewVehicle] = useState({
    placa: '',
    modelo: '',
    año: new Date().getFullYear(),
    conductor: '',
    estado: 'Activo',
    ultimaRevision: '',
    proximaRevision: '',
    kilometraje: '',
    marca: '',
    color: '',
    capacidad: '',
    tipo: '',
    asignado: false
  });
  
  const [validated, setValidated] = useState(false);

  const vehicles = [
    {
      placa: 'ABC-123',
      modelo: 'Toyota Hilux',
      año: 2022,
      conductor: 'Luis Martínez',
      estado: 'Activo',
      ultimaRevision: '15 abr 2025',
      proximaRevision: '15 jul 2025',
      kilometraje: '15000',
      marca: 'Toyota',
      color: 'Blanco',
      capacidad: '5',
      tipo: 'Camioneta',
      asignado: true
    },
    {
      placa: 'XYZ-789',
      modelo: 'Ford Transit',
      año: 2021,
      conductor: 'Pablo Cárdenas',
      estado: 'En mantenimiento',
      ultimaRevision: '10 may 2025',
      proximaRevision: '10 ago 2025',
      kilometraje: '25000',
      marca: 'Ford',
      color: 'Azul',
      capacidad: '14',
      tipo: 'Van',
      asignado: true
    },
    {
      placa: 'DEF-456',
      modelo: 'Chevrolet NPR',
      año: 2023,
      conductor: 'Sin asignar',
      estado: 'Disponible',
      ultimaRevision: '28 mar 2025',
      proximaRevision: '28 jun 2025',
      kilometraje: '8000',
      marca: 'Chevrolet',
      color: 'Blanco',
      capacidad: '2.5 ton',
      tipo: 'Camión',
      asignado: false
    },
  ];

  const filteredVehicles = vehicles.filter((vehicle) => {
    // Filtrar por término de búsqueda
    const matchesSearch = 
      vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.conductor && vehicle.conductor.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtrar por estado
    const matchesStatus = 
      statusFilter === 'Todos' || vehicle.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Mostrar detalles del vehículo
  const handleShowDetails = (vehicle) => {
    setCurrentVehicle(vehicle);
    setShowVehicleModal(true);
  };
  
  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle({
      ...newVehicle,
      [name]: value
    });
  };
  
  // Manejar envío del formulario
  const handleSubmitNewVehicle = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Aquí iría la lógica para guardar el nuevo vehículo
    
    // Cerrar modal y resetear form
    setShowNewVehicleModal(false);
    setNewVehicle({
      placa: '',
      modelo: '',
      año: new Date().getFullYear(),
      conductor: '',
      estado: 'Activo',
      ultimaRevision: '',
      proximaRevision: '',
      kilometraje: '',
      marca: '',
      color: '',
      capacidad: '',
      tipo: '',
      asignado: false
    });
    setValidated(false);
  };
  
  // Componente para el badge de estado
  const EstadoBadge = ({ estado }) => {
    let variant;
    switch (estado) {
      case 'Activo':
        variant = 'success';
        break;
      case 'En mantenimiento':
        variant = 'warning';
        break;
      case 'Disponible':
        variant = 'info';
        break;
      case 'Fuera de servicio':
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
        <h1>Gestión de Vehículos</h1>
        <Button 
          variant="warning" 
          className="d-flex align-items-center"
          onClick={() => setShowNewVehicleModal(true)}
        >
          <FaPlus className="me-2" /> Nuevo Vehículo
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
                  placeholder="Buscar por placa, modelo o conductor"
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
                  <option value="Activo">Activo</option>
                  <option value="En mantenimiento">En mantenimiento</option>
                  <option value="Disponible">Disponible</option>
                  <option value="Fuera de servicio">Fuera de servicio</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Listado de vehículos */}
      <Card>
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaCarAlt className="text-warning me-2" size={20} />
              <h5 className="mb-0">Listado de Vehículos</h5>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="vehiculos-table">
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Modelo</th>
                  <th>Año</th>
                  <th>Conductor</th>
                  <th>Estado</th>
                  <th>Última Revisión</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle, index) => (
                  <tr key={index}>
                    <td>{vehicle.placa}</td>
                    <td>{vehicle.modelo}</td>
                    <td>{vehicle.año}</td>
                    <td>
                      {vehicle.asignado ? (
                        <div className="d-flex align-items-center">
                          <FaUserCircle className="me-2 text-warning" />
                          {vehicle.conductor}
                        </div>
                      ) : (
                        <span className="text-muted">{vehicle.conductor}</span>
                      )}
                    </td>
                    <td>
                      <EstadoBadge estado={vehicle.estado} />
                    </td>
                    <td>{vehicle.ultimaRevision}</td>
                    <td>
                      <div className="action-buttons">
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleShowDetails(vehicle)}
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
          
          {filteredVehicles.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron vehículos con los criterios de búsqueda.</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal de detalles del vehículo */}
      <Modal 
        show={showVehicleModal} 
        onHide={() => setShowVehicleModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>Detalles del Vehículo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentVehicle && (
            <div className="vehicle-detail">
              <Row>
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <div className="vehicle-avatar mb-3">
                    <FaCarAlt size={100} className="text-warning" />
                  </div>
                  <h4>{currentVehicle.modelo}</h4>
                  <p className="mb-1">
                    <EstadoBadge estado={currentVehicle.estado} />
                  </p>
                  <p className="text-muted">
                    <FaIdCard className="me-2" />
                    {currentVehicle.placa}
                  </p>
                </Col>
                <Col md={8}>
                  <h5 className="mb-3">Información del Vehículo</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Marca:</strong></p>
                      <p>{currentVehicle.marca}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Año:</strong></p>
                      <p>{currentVehicle.año}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Color:</strong></p>
                      <p>{currentVehicle.color}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Tipo:</strong></p>
                      <p>{currentVehicle.tipo}</p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Mantenimiento</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Última Revisión:</strong></p>
                      <p>{currentVehicle.ultimaRevision}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Próxima Revisión:</strong></p>
                      <p>{currentVehicle.proximaRevision}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Kilometraje:</strong></p>
                      <p>{currentVehicle.kilometraje} km</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Capacidad:</strong></p>
                      <p>{currentVehicle.capacidad}</p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Asignación</h5>
                  <Row className="mb-3">
                    <Col sm={12}>
                      <p className="mb-1"><strong>Conductor Asignado:</strong></p>
                      {currentVehicle.asignado ? (
                        <p className="d-flex align-items-center">
                          <FaUserCircle className="me-2 text-warning" />
                          {currentVehicle.conductor}
                        </p>
                      ) : (
                        <p className="text-muted">Sin asignar</p>
                      )}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVehicleModal(false)}>
            Cerrar
          </Button>
          <Button variant="warning">
            <FaEdit className="me-2" /> Editar Información
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para crear nuevo vehículo */}
      <Modal
        show={showNewVehicleModal}
        onHide={() => setShowNewVehicleModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Form noValidate validated={validated} onSubmit={handleSubmitNewVehicle}>
          <Modal.Header closeButton className="border-bottom border-warning">
            <Modal.Title>
              <FaCarAlt className="me-2 text-warning" />
              Registrar Nuevo Vehículo
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="new-vehicle-form">
              {/* Información básica */}
              <h5 className="border-bottom pb-2 mb-3">Información Básica</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Placa</Form.Label>
                    <Form.Control
                      type="text"
                      name="placa"
                      value={newVehicle.placa}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: ABC-123"
                    />
                    <Form.Control.Feedback type="invalid">
                      La placa es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Marca</Form.Label>
                    <Form.Control
                      type="text"
                      name="marca"
                      value={newVehicle.marca}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      La marca es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Modelo</Form.Label>
                    <Form.Control
                      type="text"
                      name="modelo"
                      value={newVehicle.modelo}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      El modelo es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Año</Form.Label>
                    <Form.Control
                      type="number"
                      name="año"
                      value={newVehicle.año}
                      onChange={handleInputChange}
                      required
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                    <Form.Control.Feedback type="invalid">
                      El año debe ser válido
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Color</Form.Label>
                    <Form.Control
                      type="text"
                      name="color"
                      value={newVehicle.color}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      El color es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo</Form.Label>
                    <Form.Select
                      name="tipo"
                      value={newVehicle.tipo}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Automóvil">Automóvil</option>
                      <option value="Camioneta">Camioneta</option>
                      <option value="Camión">Camión</option>
                      <option value="Van">Van</option>
                      <option value="Bus">Bus</option>
                      <option value="Motocicleta">Motocicleta</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Seleccione un tipo de vehículo
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Capacidad</Form.Label>
                    <Form.Control
                      type="text"
                      name="capacidad"
                      value={newVehicle.capacidad}
                      onChange={handleInputChange}
                      placeholder="Ej: 5 pasajeros, 2.5 toneladas, etc."
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      La capacidad es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Mantenimiento */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Mantenimiento</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Última Revisión</Form.Label>
                    <Form.Control
                      type="date"
                      name="ultimaRevision"
                      value={newVehicle.ultimaRevision}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      La fecha de última revisión es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Próxima Revisión</Form.Label>
                    <Form.Control
                      type="date"
                      name="proximaRevision"
                      value={newVehicle.proximaRevision}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      La fecha de próxima revisión es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Kilometraje</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        name="kilometraje"
                        value={newVehicle.kilometraje}
                        onChange={handleInputChange}
                        min="0"
                        required
                      />
                      <InputGroup.Text>km</InputGroup.Text>
                      <Form.Control.Feedback type="invalid">
                        El kilometraje es obligatorio
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      name="estado"
                      value={newVehicle.estado}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Activo">Activo</option>
                      <option value="En mantenimiento">En mantenimiento</option>
                      <option value="Disponible">Disponible</option>
                      <option value="Fuera de servicio">Fuera de servicio</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Asignación */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Asignación</h5>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Conductor</Form.Label>
                    <Form.Select
                      name="conductor"
                      value={newVehicle.conductor}
                      onChange={handleInputChange}
                    >
                      <option value="Sin asignar">Sin asignar</option>
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
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewVehicleModal(false)}>
              Cancelar
            </Button>
            <Button variant="warning" type="submit">
              <FaSave className="me-2" /> Guardar Vehículo
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </LayoutBarButton>
  );
};

export default Vehiculos;