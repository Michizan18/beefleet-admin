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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [showNewVehicleModal, setShowNewVehicleModal] = useState(false);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]); // Nuevo estado para conductores
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editFormData, setEditFormData] = useState({});


  // Estado para nuevo vehículo
  const [newVehicle, setNewVehicle] = useState({
    placa: '',
    modelo: '',
    año: new Date().getFullYear(),
    conductor: '',
    estado_vehiculo: 'Activo',
    seguro: '',
    kilometraje: '',
    marca: '',
    color: '',
    capacidad: '',
    tipo: '',
    peso: '',
    matricula: '',
  });
  
  const [validated, setValidated] = useState(false);

  // Función para obtener el nombre del conductor por ID
  const getConductorName = (conductorId) => {
    if (!conductorId) return 'Sin asignar';
    const conductor = conductores.find(c => c.id === conductorId || c.id_conductor === conductorId);
    return conductor ? conductor.nombre : `Conductor ID: ${conductorId}`;
  };

  // Función para eliminar vehículo
  const handleDeleteVehicle = async (id_vehiculo) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/vehicles/${id_vehiculo}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Agregar token si es necesario
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el vehículo');
      }
      
      setVehiculos(vehiculos.filter(vehiculo => vehiculo.id_vehiculo !== id_vehiculo));
      alert('Vehículo eliminado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al eliminar el vehículo');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener token del localStorage si existe
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        };
        
        // Agregar Authorization header si hay token
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch vehículos y conductores en paralelo
        const [vehiclesResponse, conductoresResponse] = await Promise.all([
          fetch('http://localhost:3001/api/vehicles', {
            method: 'GET',
            headers,
          }),
          fetch('http://localhost:3001/api/conductores', { // Ajusta esta URL según tu API
            method: 'GET',
            headers,
          }).catch(error => {
            console.warn('No se pudieron cargar los conductores:', error);
            return { ok: false };
          })
        ]);

        if (!vehiclesResponse.ok) {
          throw new Error(`Error al cargar los vehículos: ${vehiclesResponse.status}`);
        }

        const vehicleData = await vehiclesResponse.json();
        console.log('Datos de vehículos:', vehicleData);
        setVehiculos(vehicleData);

        // Cargar conductores si la respuesta es exitosa
        if (conductoresResponse.ok) {
          const conductoresData = await conductoresResponse.json();
          console.log('Datos de conductores:', conductoresData);
          setConductores(conductoresData);
        } else {
          // Datos de conductores hardcodeados como fallback
          setConductores([
          ]);
        }

      } catch (error) {
        console.error("Error al cargar datos:", error);
        alert(`Error al cargar los datos: ${error.message}`);
        
        // En caso de error, usar datos de ejemplo para conductores
        setConductores([
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Función para abrir modal de edición
  const handleEditVehicle = (vehiculo) => {
  setEditingVehicle(vehiculo);
  setEditFormData({
    placa: vehiculo.placa || '',
    modelo: vehiculo.modelo || '',
    año: vehiculo.año || new Date().getFullYear(),
    conductor: vehiculo.conductor || '',
    estado_vehiculo: vehiculo.estado_vehiculo || 'Activo',
    seguro: vehiculo.seguro || '',
    kilometraje: vehiculo.kilometraje || '',
    marca: vehiculo.marca || '',
    color: vehiculo.color || '',
    capacidad: vehiculo.capacidad || '',
    tipo: vehiculo.tipo || '',
    peso: vehiculo.peso || '',
    matricula: vehiculo.matricula || '',
  });
  setShowEditModal(true);
};
 //Función para guardar cambios
const handleUpdateVehicle = async (e) => {
  e.preventDefault();
  
  console.log('Datos a enviar:', editFormData);
  try {
    const response = await fetch(`http://localhost:3001/api/vehicles/${editingVehicle.id_vehiculo}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(editFormData),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar el vehículo');
    }
    
    const updatedVehicle = await response.json();
    const vehicleWithId = { ...editFormData, id_vehiculo: editingVehicle.id_vehiculo };
    
    // Actualizar la lista de vehículos
    setVehiculos(vehiculos.map(v => 
    v.id_vehiculo === editingVehicle.id_vehiculo ? vehicleWithId : v
    ));
    
    setShowEditModal(false);
    alert('Vehículo actualizado exitosamente');
  } catch (error) {
    console.error('Error:', error);
    alert('Error al actualizar el vehículo');
  }
};

  // Filtrar vehículos
  const filteredVehicles = vehiculos.filter((vehiculo) => {
    const conductorName = getConductorName(vehiculo.conductor);
    
   const matchesSearch = searchTerm === '' ||
    vehiculo.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === 'Todos' || vehiculo.estado_vehiculo === statusFilter;
    
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
  const handleSubmitNewVehicle = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:3001/api/vehicles', {
        method: 'POST',
        headers,
        body: JSON.stringify(newVehicle),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el vehículo');
      }
      
      const nuevoVehiculo = await response.json();
      setVehiculos([...vehiculos, nuevoVehiculo]);
      
      // Cerrar modal y resetear form
      setShowNewVehicleModal(false);
      setNewVehicle({
        placa: '',
        modelo: '',
        año: new Date().getFullYear(),
        conductor: '',
        estado_vehiculo: 'Activo',
        seguro: '',
        kilometraje: '',
        marca: '',
        color: '',
        capacidad: '',
        tipo: '',
        peso: '',
        matricula: '',
      });
      setValidated(false);
      alert('Vehículo creado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el vehículo');
    }
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
  
  if (loading) {
    return (
      <LayoutBarButton userData={userData}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </LayoutBarButton>
    );
  }
  
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
              <h5 className="mb-0">Listado de Vehículos ({filteredVehicles.length})</h5>
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehiculo) => {
                  const conductorName = getConductorName(vehiculo.conductor);
                  return (
                    <tr key={vehiculo.id_vehiculo}>
                      <td>{vehiculo.placa}</td>
                      <td>{vehiculo.modelo}</td>
                      <td>{vehiculo.año}</td>
                      <td>
                        {vehiculo.conductor ? (
                          <div className="d-flex align-items-center">
                            <FaUserCircle className="me-2 text-warning" />
                            {conductorName}
                          </div>
                        ) : (
                          <span className="text-muted">Sin asignar</span>
                        )}
                      </td>
                      <td>
                        <EstadoBadge estado={vehiculo.estado_vehiculo || vehiculo.estado} />
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleShowDetails(vehiculo)}
                          >
                            Ver
                          </Button>
                          <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleEditVehicle(vehiculo)}
                          >
                          <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteVehicle(vehiculo.id_vehiculo)}
                          >
                            <FaTrashAlt />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
          
          {filteredVehicles.length === 0 && !loading && (
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
                    <EstadoBadge estado={currentVehicle.estado_vehiculo} />
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
                      <p>{currentVehicle.marca || 'N/A'}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Año:</strong></p>
                      <p>{currentVehicle.año || 'N/A'}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Color:</strong></p>
                      <p>{currentVehicle.color || 'N/A'}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Tipo:</strong></p>
                      <p>{currentVehicle.tipo || 'N/A'}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Matrícula:</strong></p>
                      <p>{currentVehicle.matricula || 'N/A'}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Peso:</strong></p>
                      <p>{currentVehicle.peso ? `${currentVehicle.peso} kg` : 'N/A'}</p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Mantenimiento</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Seguro:</strong></p>
                      <p>{currentVehicle.seguro || 'N/A'}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Kilometraje:</strong></p>
                      <p>{currentVehicle.kilometraje ? `${currentVehicle.kilometraje} km` : 'N/A'}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={12}>
                      <p className="mb-1"><strong>Capacidad:</strong></p>
                      <p>{currentVehicle.capacidad || 'N/A'}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                  <Col md={6}>
                  <Form.Group className="mb-3">
                  <Form.Label>Peso (kg)</Form.Label>
                  <Form.Control
                  type="number"
                  name="peso"
                  value={newVehicle.peso}
                  onChange={handleInputChange}
                  />
                  </Form.Group>
                  </Col>
                  <Col md={6}>
                  <Form.Group className="mb-3">
                  <Form.Label>Matrícula</Form.Label>
                  <Form.Control
                  type="text"
                  name="matricula"
                  value={newVehicle.matricula}
                  onChange={handleInputChange}
                />
                 </Form.Group>
              </Col>
              </Row>
            <Row className="mb-3">
              <Col md={12}>
              <Form.Group className="mb-3">
              <Form.Label>Seguro</Form.Label>
              <Form.Control
              type="text"
              name="seguro"
              value={newVehicle.seguro}
              onChange={handleInputChange}
            />
          </Form.Group>
          </Col>
          </Row>
                  <Row className="mb-3">
                    <Col sm={12}>
                      <p className="mb-1"><strong>Conductor Asignado:</strong></p>
                      {currentVehicle.conductor ? (
                        <p className="d-flex align-items-center">
                          <FaUserCircle className="me-2 text-warning" />
                          {getConductorName(currentVehicle.conductor)}
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
            {/* Modal de edición */}
<Modal
  show={showEditModal}
  onHide={() => setShowEditModal(false)}
  size="lg"
  centered
>
  <Form onSubmit={handleUpdateVehicle}>
    <Modal.Header closeButton>
      <Modal.Title>Editar Vehículo</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {/* Información básica */}
      <h5 className="border-bottom pb-2 mb-3">Información Básica</h5>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Placa</Form.Label>
            <Form.Control
              type="text"
              value={editFormData.placa || ''}
              onChange={(e) => setEditFormData({...editFormData, placa: e.target.value})}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Marca</Form.Label>
            <Form.Control
              type="text"
              value={editFormData.marca || ''}
              onChange={(e) => setEditFormData({...editFormData, marca: e.target.value})}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Modelo</Form.Label>
            <Form.Control
              type="text"
              value={editFormData.modelo || ''}
              onChange={(e) => setEditFormData({...editFormData, modelo: e.target.value})}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Año</Form.Label>
            <Form.Control
              type="number"
              value={editFormData.año || ''}
              onChange={(e) => setEditFormData({...editFormData, año: e.target.value})}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Color</Form.Label>
            <Form.Control
              type="text"
              value={editFormData.color || ''}
              onChange={(e) => setEditFormData({...editFormData, color: e.target.value})}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              value={editFormData.tipo || ''}
              onChange={(e) => setEditFormData({...editFormData, tipo: e.target.value})}
            >
              <option value="">Seleccionar...</option>
              <option value="Rabón">Rabón</option>
              <option value="Tornon">Tornon</option>
              <option value="Tolva">Tolva</option>
              <option value="Caja Cerrada">Caja Cerrada</option>
              <option value="Caja refrigerada">Caja refrigerada</option>
              <option value="Doble semirremolque">Doble semirremolque</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Capacidad</Form.Label>
            <Form.Control
              type="text"
              value={editFormData.capacidad || ''}
              onChange={(e) => setEditFormData({...editFormData, capacidad: e.target.value})}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Kilometraje</Form.Label>
            <Form.Control
              type="number"
              value={editFormData.kilometraje || ''}
              onChange={(e) => setEditFormData({...editFormData, kilometraje: e.target.value})}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              value={editFormData.estado_vehiculo || ''}
              onChange={(e) => setEditFormData({...editFormData, estado_vehiculo: e.target.value})}
            >
              <option value="Activo">Activo</option>
              <option value="En mantenimiento">En mantenimiento</option>
              <option value="Disponible">Disponible</option>
              <option value="Fuera de servicio">Fuera de servicio</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Conductor</Form.Label>
            <Form.Select
              value={editFormData.conductor || ''}
              onChange={(e) => setEditFormData({...editFormData, conductor: e.target.value})}
            >
              <option value="">Sin asignar</option>
              {conductores.map((conductor) => (
                <option key={conductor.id || conductor.id_conductor} value={conductor.id || conductor.id_conductor}>
                  {conductor.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowEditModal(false)}>
        Cancelar
      </Button>
      <Button variant="warning" type="submit">
        Guardar Cambios
      </Button>
    </Modal.Footer>
  </Form>
    </Modal>
    </LayoutBarButton>
  );
};

export default Vehiculos;