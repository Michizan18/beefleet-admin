import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, ProgressBar, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaClipboardList, FaChartLine, FaBell, 
  FaCalendarAlt, FaUserCircle, FaSignOutAlt, FaCog,
  FaCar
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simular carga de datos
    const fetchDashboardData = async () => {
      setLoading(true);
      const id_user = await localStorage.getItem('id_usuario');
      console.log(id_user);
      try {
        // Simulación de llamada API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Datos simulados
        const data = {
          adminName: "Carlos Rodríguez",
          stats: {
            empleadosActivos: 45,
            tareasPendientes: 12,
            proyectosActivos: 8,
            empleadosNuevos: 3,
            vehiculosActivos: 18,  // Añadido contador de vehículos
          },
          empleadosRecientes: [
            { id: 1, nombre: "Pablo Cárdenas", fechaIngreso: "2025-04-15", estado: "Activo" },
            { id: 2, nombre: "Luis Martínez", fechaIngreso: "2025-04-12", estado: "Activo" },
            { id: 3, nombre: "Mario López", fechaIngreso: "2025-04-05", estado: "Entrenamiento" }
          ],
          vehiculosRecientes: [  // Añadido datos de vehículos
            { id: 1, placa: "ABC-123", modelo: "Ford F-150", estado: "Activo" },
            { id: 2, placa: "XYZ-789", modelo: "Toyota Hilux", estado: "Activo" },
            { id: 3, placa: "DEF-456", modelo: "Chevrolet Silverado", estado: "Mantenimiento" }
          ],
          proyectos: [
            { id: 1, nombre: "Rediseño Portal Web", progreso: 75, estado: "En progreso" },
            { id: 2, nombre: "App Móvil v2.0", progreso: 30, estado: "En progreso" },
            { id: 3, nombre: "Migración de Base de Datos", progreso: 90, estado: "Final" },
            { id: 4, nombre: "Sistema de Reportes", progreso: 15, estado: "Inicial" }
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
  
  // Formatear fecha a formato español
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
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      {/* Barra de navegación superior */}
      <nav className="navbar navbar-expand navbar-dark bg-primary fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="#!">
            <strong>Bienvenido Admin</strong>
          </a>
          
          <ul className="navbar-nav ms-auto">
            <li className="nav-item dropdown">
              <Dropdown>
                <Dropdown.Toggle variant="transparent" id="notification-dropdown" className="nav-link">
                  <FaBell className="icon" />
                  <span className="badge rounded-pill bg-danger">
                    {userData?.notificaciones.length || 0}
                  </span>
                </Dropdown.Toggle>
                
                <Dropdown.Menu className="dropdown-menu-end notification-dropdown">
                  <h6 className="dropdown-header">Notificaciones</h6>
                  {userData?.notificaciones.map(notif => (
                    <Dropdown.Item key={notif.id} className={`notification-item ${notif.tipo}`}>
                      <div className="notification-text">{notif.texto}</div>
                      <div className="notification-time">{notif.tiempo}</div>
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Divider />
                  <Dropdown.Item className="text-center">Ver todas</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </li>
            
            <li className="nav-item dropdown">
              <Dropdown>
                <Dropdown.Toggle variant="transparent" id="user-dropdown" className="nav-link">
                  <FaUserCircle className="icon" />
                  <span className="d-none d-md-inline-block ms-1">
                    {userData?.adminName || 'Usuario'}
                  </span>
                </Dropdown.Toggle>
                
                <Dropdown.Menu className="dropdown-menu-end">
                  <Dropdown.Item as={Link} to="/profile">
                    <FaUserCircle className="me-2" /> Mi Perfil
                  </Dropdown.Item>
                  <Dropdown.Item href="#!">
                    <FaCog className="me-2" /> Configuración
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item href="#!">
                    <FaSignOutAlt className="me-2" /> Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* Menú lateral corregido */}
      <div className="sidebar">
        <div className="sidebar-sticky">
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link active">
                <FaChartLine className="icon" /> Dashboard
              </Link>
            </li>
            <li className="nav-item mt-3">
              <Link to="/conductores" className="nav-link">
                <FaUsers className="icon" /> Conductores
              </Link>
            </li>
            {/* Nuevo enlace para Vehículos */}
            <li className="nav-item">
              <Link to="/vehiculos" className="nav-link">
                <FaCar className="icon" /> Vehículos
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/proyectos" className="nav-link">
                <FaClipboardList className="icon" /> Proyectos
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/calendario" className="nav-link">
                <FaCalendarAlt className="icon" /> Calendario
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/profile" className="nav-link">
                <FaUserCircle className="icon" /> Mi Perfil
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Contenido principal */}
      <main className="content">
        <Container fluid>
          <h1 className="mt-4 mb-4">Dashboard</h1>
          
          {/* Tarjetas de estadísticas */}
          <Row className="stats-cards">
            <Col md={3} sm={6} className="mb-4">
              <Card className="stats-card">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="stats-icon">
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
                    <div className="stats-icon">
                      <FaClipboardList />
                    </div>
                    <div>
                      <h4 className="stats-number">{userData?.stats.tareasPendientes}</h4>
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
                    <div className="stats-icon">
                      <FaChartLine />
                    </div>
                    <div>
                      <h4 className="stats-number">{userData?.stats.proyectosActivos}</h4>
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
                    <div className="stats-icon">
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

            {/* Nueva tarjeta para Vehículos Activos */}
            <Col md={3} sm={6} className="mb-4">
              <Card className="stats-card">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="stats-icon">
                      <FaCar />
                    </div>
                    <div>
                      <h4 className="stats-number">{userData?.stats.vehiculosActivos}</h4>
                      <div className="stats-label">Vehículos Activos</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            {/* Lista de Empleados Recientes */}
            <Col lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Empleados Recientes</h5>
                  <Button as={Link} to="/conductores" variant="outline-primary" size="sm">Ver Todos</Button>
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
            
            {/* Nueva sección de Vehículos Recientes */}
            <Col lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Vehículos Recientes</h5>
                  <Button as={Link} to="/vehiculos" variant="outline-primary" size="sm">Ver Todos</Button>
                </Card.Header>
                <Card.Body>
                  <Table responsive className="table-hover">
                    <thead>
                      <tr>
                        <th>Placa</th>
                        <th>Modelo</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData?.vehiculosRecientes.map(vehiculo => (
                        <tr key={vehiculo.id}>
                          <td>{vehiculo.placa}</td>
                          <td>{vehiculo.modelo}</td>
                          <td>
                            <span className={`badge bg-${vehiculo.estado === 'Activo' ? 'success' : 'warning'} rounded-pill`}>
                              {vehiculo.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            
            {/* Reportes - Reducido a 4 columnas */}
            <Col lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Reportes recientes</h5>
                  <Button as={Link} to="/calendario" variant="outline-primary" size="sm">Ver Calendario</Button>
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
          
          {/* Proyectos */}
          <Row>
            <Col md={12} className="mb-4">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Estado de Proyectos</h5>
                  <Button as={Link} to="/proyectos" variant="outline-primary" size="sm">Gestionar Proyectos</Button>
                </Card.Header>
                <Card.Body>
                  {userData?.proyectos.map(proyecto => (
                    <div key={proyecto.id} className="project-item">
                      <div className="d-flex justify-content-between mb-1">
                        <h6 className="mb-0">{proyecto.nombre}</h6>
                        <span className="text-muted">{proyecto.progreso}%</span>
                      </div>
                      <ProgressBar 
                        now={proyecto.progreso} 
                        variant={
                          proyecto.progreso < 30 ? "danger" : 
                          proyecto.progreso < 70 ? "warning" : 
                          "success"
                        }
                        className="mb-3"
                      />
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  );
};

export default Dashboard;