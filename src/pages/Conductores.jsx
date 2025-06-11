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
import './Conductores.css';

const Vehiculos = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isUpdating, setIsUpdating] = useState('');
  const [showNewDriverModal, setShowNewDriverModal] = useState(false);
  const [showUpdateDriverModal, setShowUpdateDrivermodal] = useState(false);
  const [newDriver, setNewDriver] = useState({
    tipo_documento: '',
    documento: '',
    nombre_conductor: '',
    apellido_conductor: '',
    correo_conductor: '',
    foto: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    tipo_licencia: '',
    fecha_vencimiento: '',
    experiencia: '',
    estado: 'Activo',
  });
  const [validated, setValidated] = useState(false);
  
   // Funciónpara mapear números a texto
  const mapearEstado = (estado) => {
  const estadosMap = {
    1: 'Activo',
    2: 'En mantenimiento', 
    3: 'Disponible',
    4: 'Fuera de servicio'
  };
  return estadosMap[estado] || 'Desconocido';

  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
  };


  const fetchConductores = async () => {
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
    let filtered = conductores;
      
    
    // Aplicar filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(conductor => 
        conductor.nombre_conductor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conductor.documento?.includes(searchTerm)
      );
    }
    
    // Aplicar filtro por estado
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(conductor => conductor.estado === filterStatus);
    }
    setFilteredConductores(filtered);
    setCurrentPage(1);
    fetchConductores();
    setCurrentPage(1); // Resetear a primera página al filtrar
    fetchConductores();
  }, [searchTerm, filterStatus, conductores]);
  
  // Formatear fecha a formato español
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Gestionar el cambio de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Calcular índices para paginación
  const indexOfLastConductor = currentPage * conductoresPorPagina;
  const indexOfFirstConductor = indexOfLastConductor - conductoresPorPagina;
  const currentConductores = filteredConductores.slice(indexOfFirstConductor, indexOfLastConductor);
  
  // Calcular total de páginas
  const totalPages = Math.ceil(filteredConductores.length / conductoresPorPagina);
  
  // Mostrar detalles de conductor
  const handleShowDetails = (driver) => {
    setCurrentDriver(driver);
    setShowModal(true);
  };

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
          setConductores([]);
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
    conductor: vehiculo.conductor || '',
    estado_vehiculo: vehiculo.estado_vehiculo || 1,
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

     // Asegurar que estado_vehiculo sea un número
    const dataToSend = {
      ...editFormData,
      estado_vehiculo: parseInt(editFormData.estado_vehiculo) || 1
    };

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

  const handleDeleteDriver = async (id_conductor, nombre_conductor, apellido_conductor, documento) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar al conductor?\n\n` +
      `Nombre: ${nombre_conductor} ${apellido_conductor}\n` +
      `Documento: ${documento}`
    );
    if (confirmDelete) {
      try {
        const token = getAuthToken();
        const response = await fetch(`http://localhost:3001/api/drivers/${id_conductor}`, {
          method: 'DELETE',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Error al eliminar el Conductor');
        }
        
        // Actualiza la lista de conductores después de eliminar
        setConductores(conductores.filter(conductor => conductor.id_conductor !== id_conductor));
        
        // Mostrar mensaje de éxito
        alert(`Conductor ${nombre_conductor} ${apellido_conductor} eliminado exitosamente`);
        
      } catch (error) {
        console.error('Error:', error);
        alert(`Hubo un error al eliminar el conductor: ${error.message}`);
      }
    }
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
    const response = await fetch('http://localhost:3001/api/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newVehicle),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Error al crear vehículo');
    }

    // Si llegamos aquí, el payload mínimo funciona
    alert('¡Payload mínimo funciona! Ahora vamos agregando campos...');
    
  } catch (error) {
    console.error('=== MINIMAL TEST: Error ===', error);
    alert(`Error con payload mínimo: ${error.message}`);
  } finally {
    setIsUpdating(false);
  }
};

  // const EstadoBadge = ({ estado }) => {
  //   const variants = {
  //     Activo: 'success',
  //     'En ruta': 'primary',
  //     Descanso: 'warning',
  //     Entrenamiento: 'warning',
  //     Inactivo: 'danger'
  // };
    
  //   return <Badge bg={variants[estado] || 'secondary'}>{estado}</Badge>;
  // };
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="pagination-container d-flex justify-content-between align-items-center mt-3">
        <div className="showing-entries">
          Mostrando {indexOfFirstConductor + 1} a {Math.min(indexOfLastConductor, filteredConductores.length)} de {filteredConductores.length} registros
        </div>
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <a className="page-link" href="#!" onClick={() => handlePageChange(Math.max(1, currentPage - 1))}>
              Anterior
            </a>
          </li>
          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${i + 1 === currentPage ? 'active' : ''}`}>
              <a className="page-link" href="#!" onClick={() => handlePageChange(i + 1)}>
                {i + 1}
              </a>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <a className="page-link" href="#!" onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}>
              Siguiente
            </a>
          </li>
        </ul>
      </div>
    );
  };
  
  const testCreateDriver = async () => {
  try {
    const testPayload = {
      tipo_documento: 'CC',
      documento: '12345678',
      nombre_conductor: 'Test',
      apellido_conductor: 'Driver',
      correo_conductor: 'test@example.com',
      telefono: '1234567890',
      ciudad: 'Bogotá',
      direccion: 'Calle Test 123',
      tipo_licencia: 'B1',
      experiencia: 5,
      estado: 'Activo'
    };

    console.log('=== TEST: Enviando payload de prueba ===');
    const response = await fetch('http://localhost:3001/api/drivers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(testPayload)
    });

    const responseText = await response.text();
    console.log('=== TEST: Response ===', {
      status: response.status,
      headers: [...response.headers.entries()],
      body: responseText
    });

  } catch (error) {
    console.error('=== TEST: Error ===', error);
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
                        <EstadoBadge estado={mapearEstado(vehiculo.estado_vehiculo)} />
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
                    <EstadoBadge estado={mapearEstado(currentVehicle.estado_vehiculo)} />
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
                      <p className="mb-1"><strong>Conductor Asignado:</strong></p>
                      {currentVehicle.conductor ? (
                        <p className="d-flex align-items-center">
                          <FaUserCircle className="me-2 text-warning" />
                          {getConductorName(currentVehicle.conductor)}
                        </p>
                      ) : (
                        <option value="" disabled>Seleccionar conductor...</option>
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
          <Button 
    variant="warning"
    onClick={() => {
    setShowVehicleModal(false);
    handleEditVehicle(currentVehicle);
    }}
      >
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
          readOnly
          className="bg-light"
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
              <option value="1">Activo</option> 
              <option value="2">En mantenimiento</option>
              <option value="3">Disponible</option>
              <option value="4">Fuera de servicio</option> 
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
              {conductores.map((conductor, index) => (
              <option 
              key={`conductor-${conductor.id || conductor.id_conductor || index}`} 
              value={conductor.id || conductor.id_conductor}
              >
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
    {/* Modal de Nuevo Vehículo */}
<Modal
  show={showNewVehicleModal}
  onHide={() => setShowNewVehicleModal(false)}
  size="lg"
  centered
>
  <Form noValidate validated={validated} onSubmit={handleSubmitNewVehicle}>
    <Modal.Header closeButton>
      <Modal.Title>Nuevo Vehículo</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <h5 className="border-bottom pb-2 mb-3">Información Básica</h5>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Placa *</Form.Label>
            <Form.Control
              type="text"
              name="placa"
              value={newVehicle.placa}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Marca *</Form.Label>
            <Form.Control
              type="text"
              name="marca"
              value={newVehicle.marca}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Modelo *</Form.Label>
            <Form.Control
              type="text"
              name="modelo"
              value={newVehicle.modelo}
              onChange={handleInputChange}
              required
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
              name="color"
              value={newVehicle.color}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              name="tipo"
              value={newVehicle.tipo}
              onChange={handleInputChange}
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
              name="capacidad"
              value={newVehicle.capacidad}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Kilometraje</Form.Label>
            <Form.Control
              type="number"
              name="kilometraje"
              value={newVehicle.kilometraje}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              name="estado_vehiculo"
              value={newVehicle.estado_vehiculo}
              onChange={handleInputChange}
            >
              <option value="Activo">Activo</option>
              <option value="En mantenimiento">En mantenimiento</option>
              <option value="Disponible">Disponible</option>
              <option value="Fuera de servicio">Fuera de servicio</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Conductor</Form.Label>
            <Form.Select
              name="conductor"
              value={newVehicle.conductor}
              onChange={handleInputChange}
            >
              <option value="">Sin asignar</option>
              {conductores.map((conductor, index) => (
                <option 
                  key={`conductor-${conductor.id || conductor.id_conductor || index}`} 
                  value={conductor.id || conductor.id_conductor}
                >
                  {conductor.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowNewVehicleModal(false)}>
        Cancelar
      </Button>
      <Button variant="warning" type="submit">
        <FaSave className="me-2" /> Crear Vehículo
      </Button>
    </Modal.Footer>
  </Form>
</Modal>
    </LayoutBarButton>
  );
};
export default Vehiculos;