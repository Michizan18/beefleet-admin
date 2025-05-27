import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form } from 'react-bootstrap';
import { FaRoute, FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import './Rutas.css';

const Rutas = () => {
  const [rutasData, setRutasData] = useState([]);
  const [filteredRutas, setFilteredRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState(null);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    distancia: '',
    carga: ''
  });

  useEffect(() => {
    fetchRutas();
  }, []);

  useEffect(() => {
    // Filtrar rutas basado en el término de búsqueda
    if (searchTerm.trim() === '') {
      setFilteredRutas(rutasData);
    } else {
      const filtered = rutasData.filter(ruta => 
        ruta.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruta.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruta.carga.toString().includes(searchTerm)
      );
      setFilteredRutas(filtered);
    }
  }, [searchTerm, rutasData]);

  const fetchRutas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No se encontró token de autenticación');
        return;
      }

      const response = await fetch('http://localhost:3001/api/routes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Rutas recibidas:', data); // Para debug
        
        // Tu backend devuelve un array de arrays, necesitamos aplanar los datos
        let normalizedData = [];
        if (Array.isArray(data)) {
          // Aplanar el array de arrays a un array simple de objetos
          const flatData = data.flat();
          // Limpiar los datos, manteniendo solo las propiedades necesarias
          normalizedData = flatData.map(ruta => ({
            id_ruta: ruta.id_ruta,
            origen: ruta.origen,
            destino: ruta.destino,
            distancia: parseFloat(ruta.distancia) || 0,
            carga: parseInt(ruta.carga) || 0
          }));
        }
        
        console.log('Datos normalizados:', normalizedData); // Para debug adicional
        setRutasData(normalizedData);
        setFilteredRutas(normalizedData);
      } else if (response.status === 401) {
        alert('Token expirado o inválido. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        alert(`Error al cargar rutas: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error al cargar rutas:", error);
      alert('Error de conexión al servidor. Verifica que el backend esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRuta = () => {
    setModalMode('create');
    setSelectedRuta(null);
    setFormData({
      origen: '',
      destino: '',
      distancia: '',
      carga: ''
    });
    setShowModal(true);
  };

  const handleEditRuta = (ruta) => {
    setModalMode('edit');
    setSelectedRuta(ruta);
    setFormData({
      origen: ruta.origen,
      destino: ruta.destino,
      distancia: ruta.distancia.toString(),
      carga: ruta.carga.toString()
    });
    setShowModal(true);
  };

  const handleDeleteRuta = async (id_ruta) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta ruta?')) {
      try {
        const token = localStorage.getItem('token');
        
        // Usar 'id' en lugar de 'id_ruta' según tu ruta del backend
        const response = await fetch(`http://localhost:3001/api/routes/${id_ruta}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Actualizar la lista eliminando la ruta
          const updatedRutas = rutasData.filter(ruta => ruta.id_ruta !== id_ruta);
          setRutasData(updatedRutas);
          setFilteredRutas(updatedRutas);
          alert('Ruta eliminada exitosamente');
        } else {
          const errorData = await response.json();
          alert(`Error al eliminar la ruta: ${errorData.message || 'Error desconocido'}`);
        }
      } catch (error) {
        console.error("Error al eliminar ruta:", error);
        alert('Error de conexión al eliminar la ruta');
      }
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const rutaData = {
      origen: formData.origen.trim(),
      destino: formData.destino.trim(),
      distancia: parseFloat(formData.distancia),
      carga: parseInt(formData.carga)
    };

    // Validaciones del cliente
    if (!rutaData.origen || !rutaData.destino) {
      alert('Origen y destino son requeridos');
      return;
    }

    if (rutaData.origen.length > 45 || rutaData.destino.length > 45) {
      alert('Origen y destino no pueden exceder 45 caracteres');
      return;
    }

    if (isNaN(rutaData.distancia) || rutaData.distancia <= 0) {
      alert('La distancia debe ser un número mayor a 0');
      return;
    }

    if (isNaN(rutaData.carga) || rutaData.carga <= 0) {
      alert('La carga debe ser un número mayor a 0');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let response;
      let url = 'http://localhost:3001/api/routes';
      let method = 'POST';
      let body = JSON.stringify(rutaData);

      if (modalMode === 'edit') {
        // Para editar, usar el id_ruta en la URL y en el body
        url = `http://localhost:3001/api/routes/${selectedRuta.id_ruta}`;
        method = 'PUT';
        body = JSON.stringify({
          id_ruta: selectedRuta.id_ruta,
          ...rutaData
        });
      }

      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: body
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Respuesta del servidor:', result); // Para debug
        
        if (modalMode === 'create') {
          // Para crear, el backend devuelve { route: {...} }
          const newRuta = result.route;
          const updatedRutas = [...rutasData, newRuta];
          setRutasData(updatedRutas);
          setFilteredRutas(updatedRutas);
        } else {
          // Para actualizar, necesitamos actualizar la ruta existente
          const updatedRutas = rutasData.map(ruta => 
            ruta.id_ruta === selectedRuta.id_ruta 
              ? { ...ruta, ...rutaData, id_ruta: selectedRuta.id_ruta }
              : ruta
          );
          setRutasData(updatedRutas);
          setFilteredRutas(updatedRutas);
        }
        
        setShowModal(false);
        alert(result.message || (modalMode === 'create' ? 'Ruta creada exitosamente' : 'Ruta actualizada exitosamente'));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error al guardar ruta:", error);
      alert('Error de conexión al guardar la ruta');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const rutasContent = (
    <>
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Gestión de Rutas</h1>
        <Button variant="warning" onClick={handleCreateRuta}>
          <FaPlus className="me-2" />
          Nueva Ruta
        </Button>
      </div>

      {/* Estadísticas de rutas */}
      <Row className="stats-cards mb-4">
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon orange">
                  <FaRoute />
                </div>
                <div>
                  <h4 className="stats-number">{rutasData.length}</h4>
                  <div className="stats-label">Total Rutas</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon orange">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h4 className="stats-number">
                    {rutasData.reduce((sum, ruta) => sum + (ruta.distancia || 0), 0).toFixed(1)} km
                  </h4>
                  <div className="stats-label">Distancia Total</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon orange">
                  <FaRoute />
                </div>
                <div>
                  <h4 className="stats-number">
                    {rutasData.reduce((sum, ruta) => sum + (ruta.carga || 0), 0).toLocaleString()} kg
                  </h4>
                  <div className="stats-label">Carga Total</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon orange">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h4 className="stats-number">
                    {rutasData.length > 0 ? (rutasData.reduce((sum, ruta) => sum + (ruta.distancia || 0), 0) / rutasData.length).toFixed(1) : 0} km
                  </h4>
                  <div className="stats-label">Distancia Promedio</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de rutas */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista de Rutas ({filteredRutas.length})</h5>
          <div className="search-container">
            <Form.Control
              type="text"
              placeholder="Buscar rutas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '250px' }}
            />
          </div>
        </Card.Header>
        <Card.Body>
          {rutasData.length === 0 ? (
            <div className="text-center py-5">
              <FaRoute size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No hay rutas registradas</h5>
              <p className="text-muted">Haz clic en "Nueva Ruta" para agregar la primera ruta</p>
            </div>
          ) : (
            <Table responsive className="table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Distancia (km)</th>
                  <th>Carga (kg)</th>
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
                      <td>#{ruta.id_ruta}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaMapMarkerAlt className="text-success me-2" />
                          {ruta.origen}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaMapMarkerAlt className="text-danger me-2" />
                          {ruta.destino}
                        </div>
                      </td>
                      <td>{(ruta.distancia || 0).toFixed(1)}</td>
                      <td>{(ruta.carga || 0).toLocaleString()}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditRuta(ruta)}
                            title="Editar ruta"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteRuta(ruta.id_ruta)}
                            title="Eliminar ruta"
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
          )}
        </Card.Body>
      </Card>

      {/* Modal para crear/editar ruta */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaRoute className="me-2" />
            {modalMode === 'create' ? 'Nueva Ruta' : 'Editar Ruta'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitForm}>
          <Modal.Body>
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
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Carga (kg) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    name="carga"
                    value={formData.carga}
                    onChange={handleInputChange}
                    required
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="warning" type="submit">
              {modalMode === 'create' ? 'Crear Ruta' : 'Actualizar Ruta'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );

  return (
    <LayoutBarButton userData={userData}>
      {rutasContent}
    </LayoutBarButton>
  );
};

export default Rutas;