import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Table, Badge, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaCar } from 'react-icons/fa';
import './Vehiculos.css'; // Asegúrate de crear este archivo CSS

const Vehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos los estados');

  useEffect(() => {
    const fetchVehiculos = async () => {
      setLoading(true);
      try {
        // Simulación de llamada API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Datos simulados
        const data = [
          { id: 1, placa: 'ABC-123', modelo: 'Ford F-150', año: 2023, peso: '2500kg', matricula: '123456', seguro: 'Vigente hasta 2026', estado: 'Activo', conductor: 'Juan Pérez' },
          { id: 2, placa: 'XYZ-789', modelo: 'Toyota Hilux', año: 2022, peso: '2300kg', matricula: '654321', seguro: 'Vigente hasta 2025', estado: 'Activo', conductor: 'María López' },
          { id: 3, placa: 'DEF-456', modelo: 'Chevrolet Silverado', año: 2021, peso: '2700kg', matricula: '789012', seguro: 'Vigente hasta 2026', estado: 'En ruta', conductor: 'Pedro Ramírez' },
          { id: 4, placa: 'GHI-789', modelo: 'Nissan Frontier', año: 2022, peso: '2100kg', matricula: '345678', seguro: 'Vigente hasta 2025', estado: 'Mantenimiento', conductor: 'Ana Martínez' },
          { id: 5, placa: 'JKL-012', modelo: 'Mitsubishi L200', año: 2023, peso: '2200kg', matricula: '901234', seguro: 'Vigente hasta 2026', estado: 'Activo', conductor: 'Carlos Rodríguez' },
          { id: 6, placa: 'MNO-345', modelo: 'Volkswagen Amarok', año: 2021, peso: '2400kg', matricula: '567890', seguro: 'Vigente hasta 2025', estado: 'Inactivo', conductor: 'Laura Gutiérrez' },
        ];
        
        setVehiculos(data);
      } catch (error) {
        console.error("Error al cargar vehículos:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehiculos();
  }, []);

  // Filtrar vehículos por búsqueda y estado
  const filteredVehiculos = vehiculos.filter(vehiculo => {
    const matchesSearch = searchTerm === '' || 
      vehiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.conductor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'Todos los estados' || vehiculo.estado === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Manejar eliminación de vehículo
  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este vehículo?')) {
      setVehiculos(vehiculos.filter(vehiculo => vehiculo.id !== id));
    }
  };

  // Color de badge según estado
  const getBadgeVariant = (estado) => {
    switch (estado) {
      case 'Activo': return 'success';
      case 'En ruta': return 'primary';
      case 'Mantenimiento': return 'warning';
      case 'Inactivo': return 'secondary';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando vehículos...</p>
      </div>
    );
  }

  return (
    <div className="vehiculos-container">
      {/* Título y descripción */}
      <Container fluid className="py-4">
        <h1 className="h2 mb-4">
          <FaCar className="me-2" /> Gestión de Vehículos
        </h1>
        <p className="text-muted">
          Administra la información de los vehículos activos y su estado
        </p>

        <Card className="mb-4">
          <Card.Body>
            <Row className="align-items-center mb-3">
              <Col md={6} className="mb-3 mb-md-0">
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por placa, modelo o conductor"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaFilter />
                  </InputGroup.Text>
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option>Todos los estados</option>
                    <option>Activo</option>
                    <option>En ruta</option>
                    <option>Mantenimiento</option>
                    <option>Inactivo</option>
                  </Form.Select>
                </InputGroup>
              </Col>
              <Col md={3} className="text-md-end">
                <Button variant="primary" as={Link} to="/vehiculos/nuevo">
                  Nuevo Vehículo
                </Button>
              </Col>
            </Row>

            <Table responsive hover className="align-middle">
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
                {filteredVehiculos.length > 0 ? (
                  filteredVehiculos.map(vehiculo => (
                    <tr key={vehiculo.id}>
                      <td>{vehiculo.placa}</td>
                      <td>{vehiculo.modelo}</td>
                      <td>{vehiculo.año}</td>
                      <td>{vehiculo.conductor}</td>
                      <td>
                        <Badge bg={getBadgeVariant(vehiculo.estado)} pill>
                          {vehiculo.estado}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-info"
                            size="sm"
                            as={Link}
                            to={`/vehiculos/${vehiculo.id}`}
                            title="Ver detalles"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            as={Link}
                            to={`/vehiculos/editar/${vehiculo.id}`}
                            title="Editar"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(vehiculo.id)}
                            title="Eliminar"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No se encontraron vehículos con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Vehiculos;