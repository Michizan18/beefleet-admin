import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { FaRoute, FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';

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
  const [cargasDisponibles, setCargasDisponibles] = useState([]);

  const initialFormState = {
    origen: '',
    destino: '',
    distancia: '',
    carga: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchRutas();
    fetchCargas(); 
  }, []);

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

  const fetchCargas = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Fetching cargas...');
      
      const response = await fetch('http://localhost:3001/api/cargas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const cargas = await response.json();
        console.log('✅ Cargas recibidas:', cargas);
        setCargasDisponibles(Array.isArray(cargas) ? cargas : []);
      } else {
        console.error('❌ Error response cargas:', response.status);
        setCargasDisponibles([]);
      }
    } catch (err) {
      console.error("❌ Error al cargar cargas:", err);
      setCargasDisponibles([]);
    }
  }; 

  const fetchRutas = async () => {
    console.log('🚀 INICIANDO fetchRutas...');
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa. Por favor, inicia sesión.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/routes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar rutas');
      }

      const data = await response.json();
      console.log('📦 Datos recibidos del servidor:', data);
      
      // NORMALIZACIÓN DE DATOS CORREGIDA
      const normalizedData = Array.isArray(data) 
        ? data.map((ruta, index) => {
            console.log(`🔄 Procesando ruta ${index}:`, ruta);
            console.log(`🔍 Keys de ruta:`, Object.keys(ruta));
            
            const result = {
              id_ruta: ruta.id_ruta,
              origen: String(ruta.origen || '').trim(), // Convertir a string y limpiar espacios
              destino: String(ruta.destino || '').trim(),
              distancia: Number(ruta.distancia) || 0,
              carga: Number(ruta.carga) || 0
            };
            
            console.log(`✅ Ruta ${index} normalizada:`, result);
            return result;
          })
        : [];
      
      console.log('✅ Datos normalizados finales:', normalizedData);
      
      // DEBUG ADICIONAL
      normalizedData.forEach((ruta, index) => {
        console.log(`🔍 RUTA ${index} FINAL:`, {
          id: ruta.id_ruta,
          origen: `"${ruta.origen}"`,
          origenLength: ruta.origen?.length,
          destino: `"${ruta.destino}"`,
          destinoLength: ruta.destino?.length
        });
      });
      
      setRutasData(normalizedData);
      setFilteredRutas(normalizedData);
      
    } catch (err) {
      console.error("❌ Error al cargar rutas:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteRuta = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta ruta?')) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/routes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la ruta');
      }

      await fetchRutas();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const url = modalMode === 'create' 
        ? 'http://localhost:3001/api/routes' 
        : `http://localhost:3001/api/routes/${selectedRuta.id_ruta}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la ruta');
      }

      await fetchRutas();
      setShowModal(false);
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

  const getCargaInfo = (cargaId) => {
    if (!cargaId) return 'Sin carga';
    
    const carga = cargasDisponibles.find(c => c.id_carga === cargaId);
    if (carga) {
      return carga.descripcion || `Carga #${cargaId}`;
    }
    
    return `Carga ${cargaId}`;
  };
  
  const calculateStats = () => {
    const totalRutas = rutasData.length;
    const totalDistancia = rutasData.reduce((sum, ruta) => sum + (ruta.distancia || 0), 0);
    
    const totalCarga = rutasData.reduce((sum, ruta) => {
      if (!ruta.carga) return sum;
      
      const carga = cargasDisponibles.find(c => c.id_carga === ruta.carga);
      if (carga && carga.peso) {
        return sum + parseFloat(carga.peso);
      }
      
      return sum + (ruta.carga || 0);
    }, 0);
    
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
                    filteredRutas.map((ruta, index) => (
                      <tr key={`ruta-${ruta.id_ruta}-${index}`}>
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
                        <td className="text-end">{Number(ruta.distancia).toFixed(1)}</td>
                        <td>{getCargaInfo(ruta.carga)}</td>
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
                    ))
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
                  <Form.Label>Carga *</Form.Label>
                  {cargasDisponibles.length > 0 ? (
                    <Form.Select
                      name="carga"
                      value={formData.carga}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Seleccionar carga...</option>
                      {cargasDisponibles.map(carga => (
                        <option key={carga.id_carga} value={carga.id_carga}>
                          {carga.descripcion || `Carga #${carga.id_carga}`}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Control
                      type="number"
                      name="carga"
                      value={formData.carga}
                      onChange={handleInputChange}
                      required
                      placeholder="ID de carga"
                      disabled={isSubmitting}
                    />
                  )}
                  <Form.Text className="text-muted">
                    {cargasDisponibles.length === 0 && 'No se pudieron cargar las cargas disponibles. Ingresa el ID manualmente.'}
                  </Form.Text>
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