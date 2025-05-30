import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaChartLine, FaCalendarAlt, FaBuilding, FaSearch, FaPlus, FaEdit } from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [conductores, setConductores] = useState(null);
  const [user, setUser ] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      const userStorage = localStorage.getItem('usuario');
      if (userStorage) {
        setUser(JSON.parse(userStorage));
      }
      };
    fetchData();
    const fetchConductores = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/drivers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const driverData = await response.json();
        console.log(driverData[0]);
        
        setConductores(driverData[0]);
      } catch (error) {
        console.error("Error al cargar datos de conductores:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConductores();
  }, []);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-grow text-warning" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }
  
  // Contenido del Dashboard que irá dentro del Layout
  const dashboardContent = (
    <>
      <h1 className="mt-4 mb-4">Bienvenido, {userData?.adminName}</h1>
      
      {/* Tarjetas de estadísticas - Actualizadas con clientes */}
      <Row className="stats-cards">
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon orange">
                  <FaUsers />
                </div>
                <div>
                  <h4 className="stats-number">{conductores.lenght}</h4>
                  <div className="stats-label">Empleados Activos</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon blue">
                  <FaBuilding />
                </div>
                <div>
                  <h4 className="stats-number">{conductores.lenght}</h4>
                  <div className="stats-label">Tareas Pendientes</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon green">
                  <FaChartLine />
                </div>
                <div>
                  <h4 className="stats-number">{conductores.lenght}</h4>
                  <div className="stats-label">Proyectos Activos</div>
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
                  <FaUsers />
                </div>
                <div>
                  <h4 className="stats-number">{conductores.lenght}</h4>
                  <div className="stats-label">Nuevos Empleados</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Sección de Cargas (existente) */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>Listado de Cargas</h5>
              <Button as={Link} to="/cargas" variant="outline-warning">Ver Todas</Button>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Referencia</th>
                    <th>Cliente</th>
                    <th>Destino</th>
                    <th>Vehículo</th>
                    <th>Conductor</th>
                    <th>Estado</th>
                    <th>Valor/Peso</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {userData?.cargasRecientes.map(carga => (
                    <tr key={carga.id}>
                      <td><strong>{carga.referencia}</strong></td>
                      <td>{carga.cliente}</td>
                      <td>{carga.destino}</td>
                      <td>{carga.vehiculo}</td>
                      <td>{carga.conductor}</td>
                      <td>
                        <Badge bg={
                          carga.estado === 'Entregado' ? 'success' : 
                          carga.estado === 'En tránsito' ? 'primary' : 'warning'
                        }>
                          {carga.estado}
                        </Badge>
                      </td>
                      <td>{carga.valor} ▲ {carga.peso}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" as={Link} to={`/cargas/${carga.id}`}>
                          Ver
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
      
      {/* Sección de Empleados Recientes */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>Empleados Recientes</h5>
              <Button as={Link} to="/conductores" variant="outline-warning" size="sm">Ver Todos</Button>
            </Card.Header>
            <Card.Body>
              <Table responsive className="table-hover">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Fecha Ingreso</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {conductores.map(conductor => (
                    <tr key={conductor.id_conductor}>
                      <td>{conductor.nombre}</td>
                      <td>{formatDate(conductor.fechaIngreso)}</td>
                      <td>
                        <span className={`badge bg-${conductor.estado === 'Activo' ? 'success' : 'warning'} rounded-pill`}>
                          {conductor.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Sección existente de Reportes */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>Reportes recientes</h5>
              <Button as={Link} to="/calendario" variant="outline-warning" size="sm">Ver Calendario</Button>
            </Card.Header>
            <Card.Body>
              <div className="task-list">
                {user.reportes.map(tarea => (
                  <div key={tarea.id} className="task-item">
                    <div className="task-icon">
                      <span className={`priority-dot priority-${tarea.prioridad.toLowerCase()}`}></span>
                    </div>
                    <div className="task-info">
                      <h6 className="task-title">{tarea.descripcion}</h6>
                      <div className="task-date">
                        <FaCalendarAlt className="me-1" size={12} />
                        {formatDate(tarea.fecha)}
                      </div>
                    </div>
                    <div className="task-priority">
                      <span className={`badge bg-${tarea.prioridad === 'Alta' ? 'danger' : tarea.prioridad === 'Media' ? 'warning' : 'info'}`}>
                        {tarea.prioridad}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
  
  return (
    <LayoutBarButton user={user}>
      {dashboardContent}
    </LayoutBarButton>
  );
};

export default Dashboard;