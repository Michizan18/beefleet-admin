import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaChartLine, FaCalendarAlt, FaBuilding, FaSearch, FaPlus, FaEdit } from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import './Dashboard.css';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const id_user = await localStorage.getItem('id_usuario');
      console.log(id_user);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Datos simulados actualizados con sección de clientes
        const data = {
          stats: {
            empleadosActivos: 45,
            tareasPendientes: 12,
            proyectosActivos: 8,
            empleadosNuevos: 3,
            clientesActivos: 15,
            cargasActivas: 5
          },
          empleadosRecientes: [
            { id: 1, nombre: "Pablo Cárdenas", fechaIngreso: "2025-04-15", estado: "Activo" },
            { id: 2, nombre: "Luis Martínez", fechaIngreso: "2025-04-12", estado: "Activo" },
            { id: 3, nombre: "Mario López", fechaIngreso: "2025-04-05", estado: "Entrenamiento" }
          ],
          cargasRecientes: [
            { id: 1, referencia: "CARGA-001", cliente: "Empresa A", destino: "Ciudad X", vehiculo: "ABC-123", conductor: "Luis Martínez", estado: "En tránsito", valor: "$500,000", peso: "2.5 ton" },
            { id: 2, referencia: "CARGA-002", cliente: "Empresa B", destino: "Medellín", vehiculo: "XYZ-789", conductor: "Pablo Cárdenas", estado: "Pendiente", valor: "$350,000", peso: "1.8 ton" },
            { id: 3, referencia: "CARGA-003", cliente: "Empresa C", destino: "Cali", vehiculo: "DEF-456", conductor: "Ana López", estado: "Entregado", valor: "$750,000", peso: "3.2 ton" }
          ],
          reportes: [
            { id: 1, descripcion: "Carga completada", fecha: "2025-04-30", prioridad: "Media" },
            { id: 2, descripcion: "Revisión tecnomecánica - vehículo ABC-123", fecha: "2025-05-02", prioridad: "Alta" },
            { id: 3, descripcion: "Inconveniente con ruta", fecha: "2025-05-05", prioridad: "Alta" }
          ],
          notificaciones: [
            { id: 1, texto: "Llanta desinflada", tiempo: "Hace 2 horas", tipo: "Problema con el vehículo" },
            { id: 2, texto: "Demora carga en Cali", tiempo: "Hace 5 horas", tipo: "Retraso en la carga" },
            { id: 3, texto: "Error con carga asignada", tiempo: "Ayer", tipo: "alert" }
          ]
        };
        
        setUserData(data);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
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
                  <h4 className="stats-number">{userData?.stats.empleadosActivos}</h4>
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
                  <h4 className="stats-number">{userData?.stats.clientesActivos}</h4>
                  <div className="stats-label">Clientes Activos</div>
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
                  <h4 className="stats-number">{userData?.stats.cargasActivas}</h4>
                  <div className="stats-label">Cargas Activas</div>
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
                  <h4 className="stats-number">{userData?.stats.empleadosNuevos}</h4>
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
                  {userData?.empleadosRecientes.map(empleado => (
                    <tr key={empleado.id}>
                      <td>{empleado.nombre}</td>
                      <td>{formatDate(empleado.fechaIngreso)}</td>
                      <td>
                        <span className={`badge bg-${empleado.estado === 'Activo' ? 'success' : 'warning'} rounded-pill`}>
                          {empleado.estado}
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
                {userData?.reportes.map(tarea => (
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
    <LayoutBarButton userData={userData}>
      {dashboardContent}
    </LayoutBarButton>
  );
};

export default Dashboard;