import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaChartLine, FaCalendarAlt, FaBuilding, FaSearch, FaPlus, FaEdit } from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [conductores, setConductores] = useState([]);
  const [reportes, setReportes] = useState([]);

  const getAuthToken = useCallback(() => {
      const token = localStorage.getItem('token');
      return token ? `Bearer ${token}` : null;
  }, []);
  const fetchData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setError('No hay token de autenticación');
          setLoading(false);
          return;
        }
        const [reportesResponse, conductoresResponse] = await Promise.all([
          fetch('http://localhost:3001/api/reports', {
            method: 'GET',
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json',
            },
          }),
          fetch('http://localhost:3001/api/drivers', {
            method: 'GET',
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (!reportesResponse.ok || !conductoresResponse.ok) {
          throw new Error('Error en la respuesta de la API');
        }

        const reportesData = await reportesResponse.json();
        const conductoresData = await conductoresResponse.json();

        // Validar que los datos sean arrays y tengan la estructura esperada
        setReportes(Array.isArray(reportesData) ? reportesData : []);
        setConductores(Array.isArray(conductoresData) ? conductoresData : []);

      } catch (error) {
        console.error('Error al obtener datos:', error.message);
        // En caso de error, establecer arrays vacíos para evitar errores de renderizado
        setReportes([]);
        setConductores([]);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchData();
  }, []);

  // Formatear fecha a formato español con validación
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para obtener clase de prioridad de forma segura
  const getPriorityClass = (tipoEstado) => {
    if (!tipoEstado) return 'default';
    return tipoEstado.toLowerCase();
  };

  // Función para obtener clase de badge de forma segura
  const getBadgeClass = (tipoEstado) => {
    if (!tipoEstado) return 'secondary';
    const estado = tipoEstado.toLowerCase();
    switch (estado) {
      case 'activo':
        return 'danger';
      case 'media':
        return 'warning';
      default:
        return 'info';
    }
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
              {conductores.length > 0 ? (
                <Table responsive className="table-hover">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Fecha Vencimiento Licencia</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conductores.map(conductor => (
                      <tr key={conductor.id_conductor || Math.random()}>
                        <td>{conductor.nombre_conductor || 'Sin nombre'}</td>
                        <td>{formatDate(conductor.fecha_vencimiento)}</td>
                        <td>
                          <span className={`badge bg-${conductor.estado === 'activo' ? 'success' : 'warning'} rounded-pill`}>
                            {conductor.estado || 'Sin estado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No hay empleados para mostrar</p>
              )}
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
                {reportes.length > 0 ? (
                  reportes.map(reporte => (
                    <div key={reporte.id_estado || Math.random()} className="task-item">
                      <div className="task-icon">
                        <span className={`priority-dot priority-${getPriorityClass(reporte.tipo_estado)}`}></span>
                      </div>
                      <div className="task-info">
                        <h6 className="task-title">{reporte.descripcion || 'Sin descripción'}</h6>
                        <div className="task-date">
                          <FaCalendarAlt className="me-1" size={12} />
                          {formatDate(reporte.fecha)}
                        </div>
                      </div>
                      <div className="task-priority">
                        <span className={`badge bg-${getBadgeClass(reporte.tipo_estado)}`}>
                          {reporte.tipo_estado || 'Sin estado'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No hay reportes para mostrar</p>
                )}
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