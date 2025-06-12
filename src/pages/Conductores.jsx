import { useState, useEffect } from 'react';
import { Card, Table, Button, Dropdown, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard, 
  FaUserPlus, FaUserCircle, FaSearch, FaFilter, FaCarAlt, 
  FaEdit, FaTrashAlt, FaPlus, FaSave 
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import apiRequest from '../services/api';
import './Conductores.css';

const Conductores = () => {
  const [loading, setLoading] = useState(true);
  const [conductores, setConductores] = useState([]);
  const [filteredConductores, setFilteredConductores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNewDriverModal, setShowNewDriverModal] = useState(false);
  const [showUpdateDriverModal, setShowUpdateDriverModal] = useState(false);
  const [validated, setValidated] = useState(false);
  
  // Estado para nuevo conductor
  const initialDriverState = {
    tipo_documento: 'CC',
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
    contraseña: 'defaultPassword123',
    estado: 'Activo',
  };

  const [newDriver, setNewDriver] = useState(initialDriverState);
  const [editDriver, setEditDriver] = useState(initialDriverState);

  const conductoresPorPagina = 8;
<<<<<<< HEAD

  useEffect(() => {
    const fetchConductores = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No hay token disponible');
          return;
        }

        const response = await fetch('http://localhost:3001/api/drivers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
        }

        const driverData = await response.json();
        setConductores(driverData);
        setFilteredConductores(driverData);
      } catch (error) {
        console.error("Error al cargar datos de conductores:", error);
        alert(`Error al cargar conductores: ${error.message}`);
      } finally {
        setLoading(false);
=======
  const fetchConductores = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No hay token disponible');
        return;
>>>>>>> e15c377429bff602f53ff0a81a73b03b4fc8709c
      }
    };

    fetchConductores();
  }, []);

<<<<<<< HEAD
=======
      const response = await fetch('http://localhost:3001/api/drivers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const driverData = await response.json();
      setConductores(driverData);
      setFilteredConductores(driverData);
    } catch (error) {
      console.error("Error al cargar datos de conductores:", error);
    } finally {
      setLoading(false);
    }
  };
>>>>>>> e15c377429bff602f53ff0a81a73b03b4fc8709c
  useEffect(() => {
    let filtered = conductores;
    
    if (searchTerm) {
      filtered = filtered.filter(conductor => 
        (conductor.nombre_conductor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conductor.documento?.toString().includes(searchTerm))
      );
    }
    
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(conductor => conductor.estado === filterStatus);
    }
    
    setFilteredConductores(filtered);
<<<<<<< HEAD
    setCurrentPage(1);
=======
    setCurrentPage(1); // Resetear a primera página al filtrar
    fetchConductores();
>>>>>>> e15c377429bff602f53ff0a81a73b03b4fc8709c
  }, [searchTerm, filterStatus, conductores]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const indexOfLastConductor = currentPage * conductoresPorPagina;
  const indexOfFirstConductor = indexOfLastConductor - conductoresPorPagina;
  const currentConductores = filteredConductores.slice(indexOfFirstConductor, indexOfLastConductor);
  const totalPages = Math.ceil(filteredConductores.length / conductoresPorPagina);
  
  const handleShowDetails = (driver) => {
    setCurrentDriver(driver);
    setShowModal(true);
  };

<<<<<<< HEAD
  const handleEditDriver = (driver) => {
    setEditDriver({
      id_conductor: driver.id_conductor,
      tipo_documento: driver.tipo_documento || 'CC',
      documento: driver.documento || '',
      nombre_conductor: driver.nombre_conductor || '',
      apellido_conductor: driver.apellido_conductor || '',
      correo_conductor: driver.correo_conductor || '',
      foto: driver.foto || '',
      telefono: driver.telefono || '',
      ciudad: driver.ciudad || '',
      direccion: driver.direccion || '',
      tipo_licencia: driver.tipo_licencia || '',
      fecha_vencimiento: driver.fecha_vencimiento ? driver.fecha_vencimiento.split('T')[0] : '',
      experiencia: driver.experiencia || '',
    });
    setShowUpdateDriverModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    if (name === 'documento' || name === 'experiencia' || name === 'telefono') {
=======
  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Manejar campos numéricos específicamente
    let processedValue = value;
    
    if (name === 'documento') {
      // Solo permitir números para documento
      processedValue = value.replace(/\D/g, '');
    } else if (name === 'experiencia') {
      // Solo permitir números para experiencia
>>>>>>> e15c377429bff602f53ff0a81a73b03b4fc8709c
      processedValue = value.replace(/\D/g, '');
    }
    
    setNewDriver({
      ...newDriver,
      [name]: processedValue
    });
  };
<<<<<<< HEAD
=======

  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null; // Agregar Bearer prefix
  };
>>>>>>> e15c377429bff602f53ff0a81a73b03b4fc8709c

  const handleDeleteDriver = async (id_conductor, nombre_conductor, apellido_conductor, documento) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar al conductor?\n\n` +
      `Nombre: ${nombre_conductor} ${apellido_conductor}\n` +
      `Documento: ${documento}`
    );
    
    if (confirmDelete) {
      try {
<<<<<<< HEAD
        await api(`/drivers/${id_conductor}`, {
          method: 'DELETE'
        });
        
        setConductores(conductores.filter(conductor => conductor.id_conductor !== id_conductor));
=======
        const token = getAuthToken(); 
        if (!token) {
          throw new Error('No hay token de autenticación');
        }
        const response = await fetch(`http://localhost:3001/api/drivers/${id_conductor}`, {
          method: 'DELETE',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar el cliente');
        }
        // Actualiza la lista de conductores después de eliminar
        setConductores(conductores.filter(conductor => conductor.id_conductor !== id_conductor));
        // Mostrar mensaje de éxito
>>>>>>> e15c377429bff602f53ff0a81a73b03b4fc8709c
        alert(`Conductor ${nombre_conductor} ${apellido_conductor} eliminado exitosamente`);
      } catch (error) {
        console.error('Error:', error);
        alert(`Hubo un error al eliminar el conductor: ${error.message}`);
      }
    }
  };

<<<<<<< HEAD
  const handleSubmitNewDriver = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setIsUpdating(true);
      
      const payload = {
        tipo_documento: newDriver.tipo_documento,
        documento: parseInt(newDriver.documento, 10),
        nombre_conductor: newDriver.nombre_conductor.trim(),
        apellido_conductor: newDriver.apellido_conductor.trim(),
        correo_conductor: newDriver.correo_conductor.trim().toLowerCase(),
        foto: newDriver.foto || null,
        telefono: newDriver.telefono || null,
        ciudad: newDriver.ciudad || null,
        direccion: newDriver.direccion || null,
        tipo_licencia: newDriver.tipo_licencia,
        fecha_vencimiento: newDriver.fecha_vencimiento || null,
        experiencia: parseInt(newDriver.experiencia, 10) || 0,
        contraseña: newDriver.contraseña,
        estado: newDriver.estado
      };

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear el conductor');
      }

      const data = await response.json();
      
      alert('Conductor creado exitosamente');
      setShowNewDriverModal(false);
      setConductores(prev => [...prev, data.driver || data]);
      setNewDriver(initialDriverState);
      setValidated(false);
      
    } catch (error) {
      console.error('Error:', error);
      alert(`Hubo un error al crear el conductor: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
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

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testPayload)
      });

      if (!response.ok) {
        throw new Error('Error en la prueba del backend');
      }

      const result = await response.json();
      alert('Prueba exitosa: ' + JSON.stringify(result));
    } catch (error) {
      console.error('Error en la prueba:', error);
      alert('Error en la prueba: ' + error.message);
    }
  };

  const EstadoBadge = ({ estado }) => {
    const variants = {
      Activo: 'success',
      'En ruta': 'primary',
      Descanso: 'warning',
      Entrenamiento: 'warning',
      Inactivo: 'danger'
    };
    
    return <Badge bg={variants[estado] || 'secondary'}>{estado}</Badge>;
  };
  
=======
  // const updateConductor = async(id_conductor, updatedData) => {
  //   try {
  //     setIsUpdating(true);
  //     const response = await fetch(`http://localhost:3001/api/drivers/${id_conductor}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type' : 'application/json'
  //       },
  //       body: JSON.stringify(updatedData)
  //     });
  //     if (!response.ok){
  //       throw new Error('Error al actualizar el conductor')
  //     }
  //     const data = await response.json();
  //     setConductores(data);
  //   } catch (error) {
  //     console.error('Error:', error);
  //     alert('Hubo un error al crear el conductor');
  //   } finally{
  //     setIsUpdating(false)
  //   }
  // }

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const formData = new FormData(e.target);
  //   const updateConductor = {
  //     tipo_documento: formData.get('tipo_documento'),
  //     documento: formData.get('documento'),
  //     nombre_conductor: formData.get('nombre_conductor'),
  //     apellido_conductor: formData.get('apellido_conductor'),
  //     correo_conductor: formData.get('correo_conductor'),
  //     foto: formData.get('foto'),
  //     telefono: formData.get('telefono'),
  //     ciudad: formData.get('ciudad'),
  //     direccion: formData.get('direccion')
  //   }
  //   updateConductor(conductor.id_conductor, updateConductor);
  // }

// Función corregida para manejar el envío del formulario
const handleSubmitNewDriver = async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  
  if (form.checkValidity() === false) {
    e.stopPropagation();
    setValidated(true);
    return;
  }

  try {
    setIsUpdating(true);
    
    // Validar campos requeridos antes de enviar
    if (!newDriver.documento || !newDriver.nombre_conductor || !newDriver.correo_conductor) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    // CORREGIR EL PAYLOAD - Asegurar tipos de datos correctos
    const payload = {
      tipo_documento: newDriver.tipo_documento || 'CC',
      documento: newDriver.documento.toString(), // Asegurar que sea string
      nombre_conductor: newDriver.nombre_conductor.trim(),
      apellido_conductor: newDriver.apellido_conductor?.trim() || '',
      correo_conductor: newDriver.correo_conductor.trim(),
      foto: newDriver.foto || null, // Enviar null en lugar de string vacío
      telefono: newDriver.telefono || null,
      ciudad: newDriver.ciudad || null,
      direccion: newDriver.direccion || null,
      tipo_licencia: newDriver.tipo_licencia || null,
      fecha_vencimiento: newDriver.fecha_vencimiento || null,
      experiencia: newDriver.experiencia ? parseInt(newDriver.experiencia, 10) : null,
      estado: newDriver.estado || 'Activo'
    };

    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3001/api/drivers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(payload)
    });

    // Manejar respuesta del servidor
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error del servidor:', errorData);
      throw new Error(`Error ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    console.log('Conductor creado exitosamente:', data);
    
    alert('Conductor creado exitosamente');
    setShowNewDriverModal(false);
    
    // Actualizar la lista de conductores
    setConductores(prev => [...prev, data.driver || data]);
    
    // Limpiar el formulario
    setNewDriver({
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
    
    setValidated(false);
    
  } catch (error) {
    console.error('Error completo:', error);
    alert(`Hubo un error al crear el conductor: ${error.message}`);
  } finally {
    setIsUpdating(false);
  }
};
  
  // Componente de Paginación
>>>>>>> e15c377429bff602f53ff0a81a73b03b4fc8709c
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="pagination-container d-flex justify-content-between align-items-center mt-3">
        <div className="showing-entries">
          Mostrando {indexOfFirstConductor + 1} a {Math.min(indexOfLastConductor, filteredConductores.length)} de {filteredConductores.length} registros
        </div>
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
              Anterior
            </button>
          </li>
          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(number)}>
                {number}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
              Siguiente
            </button>
          </li>
        </ul>
      </div>
    );
  };
<<<<<<< HEAD

  if (loading) {
    return (
      <LayoutBarButton>
        <Container className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando conductores...</p>
        </Container>
      </LayoutBarButton>
    );
  }

  return (
    <LayoutBarButton>
      <div className="page-header d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Gestión de Conductores</h1>
        <div>
          <Button 
            variant="warning" 
            className="d-flex align-items-center me-2"
            onClick={() => setShowNewDriverModal(true)}
          >
            <FaPlus className="me-2" /> Nuevo Conductor
          </Button>
        </div>
=======
  
  // Componente para el badge de estado
  const EstadoBadge = ({ estado }) => {
    let variant;
    switch (estado) {
      case 'Activo':
        variant = 'success';
        break;
      case 'En ruta':
        variant = 'primary';
        break;
      case 'Descanso':
      case 'Entrenamiento':
        variant = 'warning';
        break;
      case 'Inactivo':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    
    return <span className={`badge bg-${variant} rounded-pill`}>{estado}</span>;
  };
  
  
  const conductoresContent = (
    <>
      
      <div className="page-header d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Gestión de Conductores</h1>
        <Button 
          variant="warning" 
          className="d-flex align-items-center"
          onClick={() => setShowNewDriverModal(true)}
        >
          <FaPlus className="me-2" /> Nuevo Conductor
        </Button>
>>>>>>> e15c377429bff602f53ff0a81a73b03b4fc8709c
      </div>
      
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6} lg={8}>
              <InputGroup>
                <InputGroup.Text className="bg-warning text-white">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre o cédula"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} lg={4} className="mt-3 mt-md-0">
              <InputGroup>
                <InputGroup.Text className="bg-warning text-white">
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="Activo">Activo</option>
                  <option value="En ruta">En ruta</option>
                  <option value="Descanso">Descanso</option>
                  <option value="Inactivo">Inactivo</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaUsers className="text-warning me-2" size={20} />
              <h5 className="mb-0">Listado de Conductores</h5>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="conductores-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentConductores.map((conductor) => (
                  <tr key={conductor.id_conductor}>
                    <td>{conductor.nombre_conductor} {conductor.apellido_conductor}</td>
                    <td>{conductor.documento}</td>
                    <td>{conductor.ciudad || 'No especificada'}</td>
                    <td>
                      <EstadoBadge estado={conductor.estado} />
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleShowDetails(conductor)}
                        >
                          Ver
                        </Button>
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleEditDriver(conductor)}
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteDriver(
                            conductor.id_conductor, 
                            conductor.nombre_conductor, 
                            conductor.apellido_conductor, 
                            conductor.documento
                          )}
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
          
          {filteredConductores.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron conductores con los criterios de búsqueda.</p>
            </div>
          )}
          
          {renderPagination()}
        </Card.Body>
      </Card>
      
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>Detalles del Conductor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentDriver && (
            <div className="driver-detail">
              <Row>
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <div className="driver-avatar mb-3">
                    <FaUserCircle size={100} className="text-warning" />
                  </div>
                  <h4>{currentDriver.nombre_conductor} {currentDriver.apellido_conductor}</h4>
                  <p className="mb-1">
                    <EstadoBadge estado={currentDriver.estado} />
                  </p>
                  <p className="text-muted">
                    <FaIdCard className="me-2" />
                    {currentDriver.documento} ({currentDriver.tipo_documento})
                  </p>
                </Col>
                <Col md={8}>
                  <h5 className="mb-3">Información de Contacto</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Teléfono:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaPhone className="me-2 text-warning" />
                        {currentDriver.telefono || 'No especificado'}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Email:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaEnvelope className="me-2 text-warning" />
                        {currentDriver.correo_conductor || 'No especificado'}
                      </p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Ciudad:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaMapMarkerAlt className="me-2 text-warning" />
                        {currentDriver.ciudad || 'No especificada'}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Dirección:</strong></p>
                      <p>
                        {currentDriver.direccion || 'No especificada'}
                      </p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Información Laboral</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Experiencia:</strong></p>
                      <p>{currentDriver.experiencia ? `${currentDriver.experiencia} años` : 'No especificada'}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Tipo de licencia:</strong></p>
                      <p>
                        <Badge bg="warning" className="me-2">
                          {currentDriver.tipo_licencia || 'No especificada'}
                        </Badge>
                      </p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Fecha vencimiento licencia:</strong></p>
                      <p>{formatDate(currentDriver.fecha_vencimiento)}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
          <Button 
            variant="warning"
            onClick={() => {
              setShowModal(false);
              handleEditDriver(currentDriver);
            }}
          >
            <FaEdit className="me-2" /> Editar
          </Button>
        </Modal.Footer>
      </Modal>
      
      <Modal
        show={showNewDriverModal}
        onHide={() => {
          setShowNewDriverModal(false);
          setNewDriver(initialDriverState);
          setValidated(false);
        }}
        size="lg"
        centered
        backdrop="static"
      >
        <Form noValidate validated={validated} onSubmit={handleSubmitNewDriver}>
          <Modal.Header closeButton className="border-bottom border-warning">
            <Modal.Title>
              <FaUserPlus className="me-2 text-warning" />
              Registrar Nuevo Conductor
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="new-driver-form">
              <h5 className="border-bottom pb-2 mb-3">Información Personal</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Documento</Form.Label>
                    <Form.Select
                      name="tipo_documento"
                      value={newDriver.tipo_documento}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="PAS">Pasaporte</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Seleccione un tipo de documento
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Número de Documento</Form.Label>
                    <Form.Control
                      type="text"
                      name="documento"
                      value={newDriver.documento}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]+"
                      minLength="8"
                      maxLength="12"
                      title="Solo se permiten números (8-12 dígitos)"
                    />
                    <Form.Control.Feedback type="invalid">
                      Documento requerido (8-12 dígitos)
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre_conductor"
                      value={newDriver.nombre_conductor}
                      onChange={handleInputChange}
                      required
                      maxLength={45}
                    />
                    <Form.Control.Feedback type="invalid">
                      El nombre es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellido</Form.Label>
                    <Form.Control
                      type="text"
                      name="apellido_conductor"
                      value={newDriver.apellido_conductor}
                      onChange={handleInputChange}
                      required
                      maxLength={45}
                    />
                    <Form.Control.Feedback type="invalid">
                      El apellido es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Correo Electrónico</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-warning text-white">
                        <FaEnvelope />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="correo_conductor"
                        value={newDriver.correo_conductor}
                        onChange={handleInputChange}
                        required
                        maxLength={45}
                      />
                      <Form.Control.Feedback type="invalid">
                        Ingrese un correo válido
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-warning text-white">
                        <FaPhone />
                      </InputGroup.Text>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={newDriver.telefono}
                        onChange={handleInputChange}
                        required
                        maxLength={45}
                      />
                      <Form.Control.Feedback type="invalid">
                        Teléfono requerido
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>URL de Foto</Form.Label>
                    <Form.Control
                      type="url"
                      name="foto"
                      value={newDriver.foto}
                      onChange={handleInputChange}
                      maxLength={200}
                      placeholder="https://ejemplo.com/foto.jpg"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Ubicación</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ciudad</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-warning text-white">
                        <FaMapMarkerAlt />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="ciudad"
                        value={newDriver.ciudad}
                        onChange={handleInputChange}
                        required
                        maxLength={100}
                      />
                      <Form.Control.Feedback type="invalid">
                        Ciudad requerida
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                      type="text"
                      name="direccion"
                      value={newDriver.direccion}
                      onChange={handleInputChange}
                      required
                      maxLength={250}
                    />
                    <Form.Control.Feedback type="invalid">
                      Dirección requerida
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Licencia</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Licencia</Form.Label>
                    <Form.Select
                      name="tipo_licencia"
                      value={newDriver.tipo_licencia}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="A1">A1 - Motocicletas</option>
                      <option value="A2">A2 - Motocicletas, motocarros, cuatrimotos</option>
                      <option value="B1">B1 - Automóviles, camionetas</option>
                      <option value="B2">B2 - Camiones rígidos, buses</option>
                      <option value="B3">B3 - Vehículos articulados</option>
                      <option value="C1">C1 - Automóviles, camionetas servicio público</option>
                      <option value="C2">C2 - Camiones rígidos, buses servicio público</option>
                      <option value="C3">C3 - Vehículos articulados servicio público</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Seleccione un tipo de licencia
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Vencimiento</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha_vencimiento"
                      value={newDriver.fecha_vencimiento}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Fecha de vencimiento requerida
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Años de Experiencia</Form.Label>
                    <Form.Control
                      type="text"
                      name="experiencia"
                      value={newDriver.experiencia}
                      onChange={handleInputChange}
                      pattern="[0-9]*"
                      title="Solo números"
                      placeholder="Ej: 5"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Cuenta</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      name="estado"
                      value={newDriver.estado}
                      onChange={handleInputChange}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="En ruta">En ruta</option>
                      <option value="Descanso">Descanso</option>
                      <option value="Entrenamiento">Entrenamiento</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowNewDriverModal(false);
                setNewDriver(initialDriverState);
                setValidated(false);
              }}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button 
              variant="warning" 
              type="submit"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="me-2" /> Guardar Conductor
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Modal para editar conductor (similar al de nuevo conductor) */}
      <Modal
        show={showUpdateDriverModal}
        onHide={() => setShowUpdateDriverModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>
            <FaEdit className="me-2 text-warning" />
            Editar Conductor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Formulario similar al de nuevo conductor pero con datos de editDriver */}
          <p>Formulario de edición aquí...</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateDriverModal(false)}>
            Cancelar
          </Button>
          <Button variant="warning">
            <FaSave className="me-2" /> Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </LayoutBarButton>
  );
};

export default Conductores;