import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaChartLine, FaCalendarAlt, FaBuilding, FaSearch, FaPlus, FaEdit } from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import './Dashboard.css';


const Dashboard = () => {
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false); // Establece loading en false después de obtener los datos
      }
    };

    fetchData();
  }, []);

  // Formatear fecha a formato español
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
      <h1 className="mt-4 mb-4">Dashboard</h1>

      {/* Tarjetas de estadísticas */}
      <Row className="stats-cards">
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon orange">
                  <FaUsers />
                </div>
                <div>
                  <h4 className="stats-number">{conductores.length}</h4>
                  <div className="stats-label">Empleados Activos</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Otras tarjetas... */}
      </Row>

      <Row>
        {/* Lista de Empleados Recientes */}
        <Col lg={6} className="mb-4">
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
                      <td>{conductor.nombre_conductor}</td>
                      <td>{formatDate(conductor.fechaVencimiento)}</td>
                      <td>
                        <span className={`badge bg-${conductor.estado === 'activo' ? 'success' : 'warning'} rounded-pill`}>
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

        {/* Reportes */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>Reportes recientes</h5>
              <Button as={Link} to="/calendario" variant="outline-warning" size="sm">Ver Calendario</Button>
            </Card.Header>
            <Card.Body>
              <div className="task-list">
                {reportes.map(reporte => (
                  <div key={reporte.id_estado} className="task-item">
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
    <LayoutBarButton>
      {dashboardContent}
    </LayoutBarButton>
  );
};

export default Dashboard;
