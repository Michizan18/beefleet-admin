import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaChartLine, FaCalendarAlt, FaSearch, FaCar } from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import './Dashboard.css';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('Todos');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Datos simulados (incluyendo vehículos)
        const data = {
          adminName: "Carlos Rodríguez",
          stats: {
            empleadosActivos: 45,
            tareasPendientes: 12,
            proyectosActivos: 8,
            vehiculosActivos: 15,
          },
          empleadosRecientes: [
            { id: 1, nombre: "Pablo Cárdenas", fechaIngreso: "2025-04-15", estado: "Activo" },
            { id: 2, nombre: "Luis Martínez", fechaIngreso: "2025-04-12", estado: "Activo" }
          ],
          vehiculosRecientes: [
            { 
              id: 1, 
              placa: "ABC-123", 
              modelo: "Toyota Hilux", 
              conductor: "Luis Martínez", 
              ciudad: "Bogotá",
              estado: "Activo", 
              ultimaRevision: "2025-04-15" 
            },
            { 
              id: 2, 
              placa: "XYZ-789", 
              modelo: "Ford Transit", 
              conductor: "Pablo Cárdenas", 
              ciudad: "Medellín",
              estado: "Mantenimiento", 
              ultimaRevision: "2025-05-02" 
            }
          ]
        };
        setUserData(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
  };

  // Filtrar vehículos
  const filteredVehicles = userData?.vehiculosRecientes.filter(vehicle => {
    const matchesSearch = vehicle.placa.toLowerCase().includes(vehicleSearch.toLowerCase()) || 
                         vehicle.modelo.toLowerCase().includes(vehicleSearch.toLowerCase());
    const matchesStatus = vehicleStatusFilter === 'Todos' || vehicle.estado === vehicleStatusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="loading-spinner">Cargando...</div>;
  }

  return (
    <LayoutBarButton userData={userData}>
      <h1 className="mt-4 mb-4">Dashboard</h1>

      {/* Tarjetas de estadísticas (actualizadas) */}
      <Row className="stats-cards">
        <Col md={3} sm={6}>
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon orange">
                  <FaUsers />
                </div>
                <div>
                  <h4>{userData.stats.empleadosActivos}</h4>
                  <p>Empleados Activos</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon orange">
                  <FaCar />
                </div>
                <div>
                  <h4>{userData.stats.vehiculosActivos}</h4>
                  <p>Vehículos Activos</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {/* ... otras tarjetas */}
      </Row>

      {/* Sección de Conductores (existente) */}
      <Row className="mt-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>
              <h5>Empleados Recientes</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover>
                {/* ... tabla existente */}
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sección de Vehículos (nueva - estilo Conductores) */}
      <Row className="mt-4">
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center py-3">
              <div>
                <h5 className="mb-1">Gestión de Vehículos</h5>
                <small className="text-muted">Buscar por placa, modelo o conductor</small>
              </div>
              <div className="d-flex gap-2">
                <div className="input-group input-group-sm" style={{ width: '200px' }}>
                  <span className="input-group-text"><FaSearch size={12} /></span>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="form-control"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                  />
                </div>
                <select 
                  className="form-select form-select-sm"
                  value={vehicleStatusFilter}
                  onChange={(e) => setVehicleStatusFilter(e.target.value)}
                  style={{ width: '150px' }}
                >
                  <option>Todos los estados</option>
                  <option>Activo</option>
                  <option>Mantenimiento</option>
                  <option>Disponible</option>
                </select>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Table striped hover className="mb-0">
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Modelo</th>
                    <th>Conductor</th>
                    <th>Ciudad</th>
                    <th>Estado</th>
                    <th>Última Revisión</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles?.map(vehicle => (
                    <tr key={vehicle.id}>
                      <td>{vehicle.placa}</td>
                      <td>{vehicle.modelo}</td>
                      <td>{vehicle.conductor}</td>
                      <td>{vehicle.ciudad}</td>
                      <td>
                        <span className={`badge bg-${
                          vehicle.estado === 'Activo' ? 'success' :
                          vehicle.estado === 'Mantenimiento' ? 'warning' : 'info'
                        }`}>
                          {vehicle.estado}
                        </span>
                      </td>
                      <td>{formatDate(vehicle.ultimaRevision)}</td>
                      <td>
                        <Button variant="link" size="sm" className="p-0 me-2">
                          <i className="bi bi-pencil text-warning"></i>
                        </Button>
                        <Button variant="link" size="sm" className="p-0">
                          <i className="bi bi-trash text-danger"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </LayoutBarButton>
  );
};

export default Dashboard;