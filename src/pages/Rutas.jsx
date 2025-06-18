import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { FaRoute, FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import Swal from 'sweetalert2';

const Rutas = () => {
  const [rutasData, setRutasData] = useState([]);
  const [filteredRutas, setFilteredRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cargas, setCargas] = useState([]);

  const initialFormState = {
    origen: '',
    destino: '',
    distancia: '',
    carga: ''
  };

  const [formData, setFormData] = useState(initialFormState);


  const getCargaDescription = (id_carga) => {
    if (!id_carga) return 'Sin carga asignada';
    const carga = cargas.find(c => c.id_carga === id_carga);
    return carga ? carga.descripcion : `Carga ID: ${id_carga}`;
};

  // FILTRO CORREGIDO
  useEffect(() => {
    const filtered = rutasData.filter(ruta => {
      const searchTermLower = searchTerm.toLowerCase();
      const origen = String(ruta.origen || '').toLowerCase();
      const destino = String(ruta.destino || '').toLowerCase();
      
      return (
        origen.includes(searchTermLower) ||
        destino.includes(searchTermLower) ||
        String(ruta.distancia || 0).includes(searchTerm) ||
        String(ruta.carga || 0).includes(searchTerm)
      );
    });
    setFilteredRutas(filtered);
  }, [searchTerm, rutasData]);

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
      const [routesResponse, loadsResponse] = await Promise.all([
        fetch('http://localhost:3001/api/routes', {
          method: 'GET',
          headers,
        }),
        fetch('http://localhost:3001/api/loads', { // Ajusta esta URL según tu API
          method: 'GET',
          headers,
        }).catch(error => {
          console.warn('No se pudieron cargar las cargas:', error);
          return { ok: false };
        })
      ]);

      if (!loadsResponse.ok) {
        throw new Error(`Error al cargar las rutas: ${loadsResponse.status}`);
      }

      const routesData = await routesResponse.json();
      console.log('Datos de Rutas:', routesData);
      setRutasData(routesData);

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
      console.error("Error al cargar datos:", error);
      Swal.fire({
        title: 'Error al cargar datos',
        text: `No se pudieron cargar los datos: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107'
      });
      
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

  const handleCreateRuta = () => {
    setFormData(initialFormState);
    setModalMode('create');
    setSelectedRuta(null);
    setShowModal(true);
  };

  const handleEditRuta = (ruta) => {
    setFormData({
      origen: ruta.origen,
      destino: ruta.destino,
      distancia: ruta.distancia,
      carga: ruta.carga
    });
    setModalMode('edit');
    setSelectedRuta(ruta);
    setShowModal(true);
  };

  const handleDeleteRuta = async (id_ruta) => {
    const result = await Swal.fire({
      title: '¿Eliminar ruta?',
      text: '¿Estás seguro de que deseas eliminar esta ruta? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/routes/${id_ruta}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la ruta');
      }

      await fetchData();
      Swal.fire({
  title: '¡Eliminada!',
  text: 'La ruta ha sido eliminada correctamente.',
  icon: 'success',
  confirmButtonText: 'OK',
  confirmButtonColor: '#ffc107',
  timer: 2000,
  timerProgressBar: true
});
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.origen.trim()) errors.push('El origen es requerido');
    if (!formData.destino.trim()) errors.push('El destino es requerido');
    if (formData.origen.length > 45) errors.push('El origen no puede exceder 45 caracteres');
    if (formData.destino.length > 45) errors.push('El destino no puede exceder 45 caracteres');
    
    const distancia = parseFloat(formData.distancia);
    if (isNaN(distancia) || distancia <= 0) errors.push('La distancia debe ser un número mayor a 0');
    
    const carga = parseInt(formData.carga);
    if (isNaN(carga) || carga <= 0) errors.push('La carga debe ser un número mayor a 0');

    return errors;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const rutaData = {
        origen: formData.origen.trim(),
        destino: formData.destino.trim(),
        distancia: parseFloat(formData.distancia),
        carga: parseInt(formData.carga)
      };

      const isEdit = modalMode === 'edit';
      const url = `http://localhost:3001/api/routes${isEdit ? `/${selectedRuta.id_ruta}` : ''}`;
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { id_ruta: selectedRuta.id_ruta, ...rutaData } : rutaData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          origen: formData.origen,
          destino: formData.destino,
          distancia: parseFloat(formData.distancia),
          carga: parseInt(formData.carga)
        })
      });

      fetchData();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la ruta');
      }

      const result = await response.json();
      const newRuta = isEdit ? null : result.route;
      
      // Actualizar estado local
      setRutasData(prev => 
        isEdit
          ? prev.map(r => r.id_ruta === selectedRuta.id_ruta ? { ...r, ...rutaData } : r)
          : [...prev, newRuta]
      );

      setShowModal(false);
      // Después de setShowModal(false);
      Swal.fire({
        title: '¡Éxito!',
        text: `La ruta ha sido ${modalMode === 'create' ? 'creada' : 'actualizada'} correctamente.`,
        icon: 'success',
        confirmButtonText: 'Perfecto',
        confirmButtonColor: '#ffc107',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateStats = () => {
    const totalRutas = rutasData.length;
    const totalDistancia = rutasData.reduce((sum, ruta) => sum + ruta.distancia, 0);
    const totalCarga = rutasData.reduce((sum, ruta) => sum + ruta.carga, 0);
    const distanciaPromedio = totalRutas > 0 ? totalDistancia / totalRutas : 0;

    return { totalRutas, totalDistancia, totalCarga, distanciaPromedio };
  };

  const { totalRutas, totalDistancia, totalCarga, distanciaPromedio } = calculateStats();

  if (loading) {
    return (
      <LayoutBarButton>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
          <Spinner animation="border" variant="warning" />
          <span className="ms-3">Cargando rutas...</span>
        </div>
      </LayoutBarButton>
    );
  }

  return (
    <LayoutBarButton>
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Gestión de Rutas</h1>
        <Button variant="warning" onClick={handleCreateRuta}>
          <FaPlus className="me-2" />
          Nueva Ruta
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4">
          <pre>{error}</pre>
        </Alert>
      )}

      {/* Estadísticas de rutas */}
      <Row className="stats-cards mb-4">
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon orange">
                  <FaRoute />
                </div>
                <div>
                  <h4 className="stats-number">{totalRutas}</h4>
                  <div className="stats-label">Total Rutas</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon orange">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h4 className="stats-number">{totalDistancia.toFixed(1)} km</h4>
                  <div className="stats-label">Distancia Total</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon orange">
                  <FaRoute />
                </div>
                <div>
                  <h4 className="stats-number">{totalCarga.toLocaleString()}</h4>
                  <div className="stats-label">Carga Total</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon orange">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h4 className="stats-number">{distanciaPromedio.toFixed(1)} km</h4>
                  <div className="stats-label">Distancia Promedio</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de rutas */}
      <Card className="mb-4">
        <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <h5 className="mb-3 mb-md-0">Lista de Rutas ({filteredRutas.length})</h5>
          <Form.Control
            type="search"
            placeholder="Buscar rutas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', maxWidth: '300px' }}
          />
        </Card.Header>
        <Card.Body>
          {rutasData.length === 0 ? (
            <div className="text-center py-5">
              <FaRoute size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No hay rutas registradas</h5>
              <Button variant="warning" onClick={handleCreateRuta} className="mt-3">
                <FaPlus className="me-2" />
                Crear primera ruta
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th className="text-end">Distancia (km)</th>
                    <th>Carga</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRutas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="text-muted">
                        <FaSearch size={32} className="mb-2 opacity-50" />
                        <p>No se encontraron rutas que coincidan con tu búsqueda</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                    filteredRutas.map((ruta) => {
                      console.log('Ruta:', ruta); // Verifica la ruta actual
                      console.log('Carga ID:', ruta.carga); // Verifica el ID de carga
                      console.log('Cargas:', cargas); // Verifica el array de cargas
                      const descripcionCarga = getCargaDescription(ruta.carga);
                      return (
                        <tr key={ruta.id_ruta}>
                          <td>
                            <span className="fw-bold">{ruta.id_ruta}</span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaMapMarkerAlt className="text-success me-2" />
                              {ruta.origen && ruta.origen.length > 0 
                                ? ruta.origen.charAt(0).toUpperCase() + ruta.origen.slice(1).toLowerCase()
                                : 'Sin origen'
                              }
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaMapMarkerAlt className="text-danger me-2" />
                              {ruta.destino && ruta.destino.length > 0
                                ? ruta.destino.charAt(0).toUpperCase() + ruta.destino.slice(1).toLowerCase()
                                : 'Sin destino'
                              }
                            </div>
                          </td>
                          <td className="text-end">{ruta.distancia.toFixed(1)}</td>
                          <td className="text-end">{descripcionCarga}</td> {/* Aquí se llama a la función */}
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditRuta(ruta)}
                                title="Editar ruta"
                                disabled={isSubmitting}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteRuta(ruta.id_ruta)}
                                title="Eliminar ruta"
                                disabled={isSubmitting}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para crear/editar ruta */}
      <Modal show={showModal} onHide={() => !isSubmitting && setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaRoute className="me-2" />
            {modalMode === 'create' ? 'Nueva Ruta' : 'Editar Ruta'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitForm}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" className="mb-4">
                <pre>{error}</pre>
              </Alert>
            )}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaMapMarkerAlt className="text-success me-1" />
                    Origen *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="origen"
                    value={formData.origen}
                    onChange={handleInputChange}
                    required
                    placeholder="Ciudad de origen"
                    maxLength={45}
                    disabled={isSubmitting}
                  />
                  <Form.Text className="text-muted">
                    Máximo 45 caracteres
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaMapMarkerAlt className="text-danger me-1" />
                    Destino *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="destino"
                    value={formData.destino}
                    onChange={handleInputChange}
                    required
                    placeholder="Ciudad de destino"
                    maxLength={45}
                    disabled={isSubmitting}
                  />
                  <Form.Text className="text-muted">
                    Máximo 45 caracteres
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Distancia (km) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min="0.1"
                    name="distancia"
                    value={formData.distancia}
                    onChange={handleInputChange}
                    required
                    placeholder="0.0"
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
  <Form.Label>Carga disponible (kg) *</Form.Label>
    <Form.Control
        as="select"
        name="carga"
        value={formData.carga}
        onChange={handleInputChange}
        required
        disabled={isSubmitting}
    >
        <option value="">Selecciona una carga</option>
        {cargas.map((carga, index) => (
            <option key={`carga-${index}`} value={carga.id}>
                {carga.descripcion} - {carga.peso} kg
            </option>
        ))}
    </Form.Control>
</Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              variant="warning" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  {modalMode === 'create' ? 'Creando...' : 'Actualizando...'}
                </>
              ) : (
                modalMode === 'create' ? 'Crear Ruta' : 'Actualizar Ruta'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </LayoutBarButton>
  );
};

export default Rutas;