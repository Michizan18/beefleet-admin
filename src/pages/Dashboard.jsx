import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaChartLine, FaCalendarAlt, FaBuilding, FaSearch, FaPlus, FaEdit } from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import './Dashboard.css';


const Dashboard = () => {
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [conductores, setConductores] = useState(null);
  const [user, setUser ] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      const userStorage = localStorage.getItem('veterinario');
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
=======
  const [conductores, setConductores] = useState([]);
  const [reportes, setReportes] = useState([]);
  // const [userData, setUserData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportesResponse, conductoresResponse] = await Promise.all([
          fetch('http://localhost:3001/api/reports', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          fetch('http://localhost:3001/api/drivers', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (!reportesResponse.ok || !conductoresResponse.ok) {
          throw new Error('Error en la respuesta de la API');
        }

        const reportesData = await reportesResponse.json();
        const conductoresData = await conductoresResponse.json();

        setReportes(reportesData);
        setConductores(conductoresData);

        // const parced = localStorage.getItem('usuario');
        // if (parced) {
        //   const parced2 = JSON.parse(parced);
        //   const userStorage = parced2.user;
        //   if (userStorage) {
        //     setUserData(userStorage);
        //   }
        // }
        // console.log(userStorage)
      } catch (error) {
        console.error('Error al obtener datos:', error);
>>>>>>> main
      } finally {
        setLoading(false); // Establece loading en false después de obtener los datos
      }
    };
<<<<<<< HEAD
    fetchConductores();
  }, []);
  
=======

    fetchData();
  }, []);

  // Formatear fecha a formato español
>>>>>>> main
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
<<<<<<< HEAD
      <h1 className="mt-4 mb-4">Bienvenido, {userData?.adminName}</h1>
      
      {/* Tarjetas de estadísticas - Actualizadas con clientes */}
=======
      <h1 className="mt-4 mb-4">Dashboard</h1>

      {/* Tarjetas de estadísticas */}
>>>>>>> main
      <Row className="stats-cards">
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon orange">
                  <FaUsers />
                </div>
                <div>
<<<<<<< HEAD
                  <h4 className="stats-number">{conductores.lenght}</h4>
=======
                  <h4 className="stats-number">{conductores.length}</h4>
>>>>>>> main
                  <div className="stats-label">Empleados Activos</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
<<<<<<< HEAD
        
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
=======

        {/* Otras tarjetas... */}
      </Row>

      <Row>
        {/* Lista de Empleados Recientes */}
        <Col lg={6} className="mb-4">
>>>>>>> main
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
<<<<<<< HEAD
                      <td>{conductor.nombre}</td>
                      <td>{formatDate(conductor.fechaIngreso)}</td>
                      <td>
                        <span className={`badge bg-${conductor.estado === 'Activo' ? 'success' : 'warning'} rounded-pill`}>
=======
                      <td>{conductor.nombre_conductor}</td>
                      <td>{formatDate(conductor.fechaVencimiento)}</td>
                      <td>
                        <span className={`badge bg-${conductor.estado === 'activo' ? 'success' : 'warning'} rounded-pill`}>
>>>>>>> main
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
<<<<<<< HEAD
      </Row>
      
      {/* Sección existente de Reportes */}
      <Row>
=======

        {/* Reportes */}
>>>>>>> main
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>Reportes recientes</h5>
              <Button as={Link} to="/calendario" variant="outline-warning" size="sm">Ver Calendario</Button>
            </Card.Header>
            <Card.Body>
              <div className="task-list">
<<<<<<< HEAD
                {user.reportes.map(tarea => (
                  <div key={tarea.id} className="task-item">
=======
                {reportes.map(reporte => (
                  <div key={reporte.id_estado} className="task-item">
>>>>>>> main
                    <div className="task-icon">
                      <span className={`priority-dot priority-${reporte.tipo_estado.toLowerCase()}`}></span>
                    </div>
                    <div className="task-info">
                      <h6 className="task-title">{reporte.descripcion}</h6>
                      <div className="task-date">
                        <FaCalendarAlt className="me-1" size={12} />
                        {formatDate(reporte.fecha)}
                      </div>
                    </div>
                    <div className="task-priority">
                      <span className={`badge bg-${reporte.tipo_estado === 'activo' ? 'danger' : reporte.tipo_estado === 'Media' ? 'warning' : 'info'}`}>
                        {reporte.tipo_estado}
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
<<<<<<< HEAD
    <LayoutBarButton user={user}>
=======
    <LayoutBarButton>
>>>>>>> main
      {dashboardContent}
    </LayoutBarButton>
  );
};

export default Dashboard;
