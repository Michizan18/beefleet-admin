import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaBell, FaTrash, FaCheck, FaEye, FaExclamationTriangle, FaCar, FaCalendarAlt } from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import Swal from 'sweetalert2';

const NotificacionesAdmin = () => {
  const [reportesData, setReportesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReporte, setSelectedReporte] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehiculos, setVehiculos] = useState([]);

  const getVehiculoDescription = (id_vehiculo) => {
    if (!id_vehiculo) return 'Sin vehículo asignado';
    const vehiculo = vehiculos.find(v => v.id === id_vehiculo);
    return vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.placa}` : `Vehículo ID: ${id_vehiculo}`;
  };

  const getTipoReporteBadge = (tipo) => {
    const tipos = {
      'mantenimiento': { variant: 'warning', icon: <FaCar className="me-1" />, text: 'Mantenimiento' },
      'accidente': { variant: 'danger', icon: <FaExclamationTriangle className="me-1" />, text: 'Accidente' },
      'revision': { variant: 'info', icon: <FaCheck className="me-1" />, text: 'Revisión' },
      'otro': { variant: 'secondary', icon: <FaBell className="me-1" />, text: 'Otro' }
    };
    
    const tipoInfo = tipos[tipo?.toLowerCase()] || tipos['otro'];
    return (
      <Badge bg={tipoInfo.variant}>
        {tipoInfo.icon}
        {tipoInfo.text}
      </Badge>
    );
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch reportes y vehículos en paralelo
      const [reportsResponse, vehiclesResponse] = await Promise.all([
        fetch('http://localhost:3001/api/reports', {
          method: 'GET',
          headers,
        }),
        fetch('http://localhost:3001/api/vehicles', {
          method: 'GET',
          headers,
        }).catch(error => {
          console.warn('No se pudieron cargar los vehículos:', error);
          return { ok: false };
        })
      ]);

      if (!reportsResponse.ok) {
        throw new Error(`Error al cargar los reportes: ${reportsResponse.status}`);
      }

      const reportsData = await reportsResponse.json();
      console.log('Datos de Reportes:', reportsData);
      setReportesData(reportsData);

      // Cargar vehículos si la respuesta es exitosa
      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        console.log('Datos de Vehículos:', vehiclesData);
        setVehiculos(vehiclesData);
      } else {
        setVehiculos([]);
      }

    } catch (error) {
      console.error("Error al cargar datos:", error);
      Swal.fire({
        title: 'Error al cargar datos',
        text: `No se pudieron cargar los datos: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107'
      });
      
      setVehiculos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewReporte = (reporte) => {
    setSelectedReporte(reporte);
    setShowModal(true);
  };

  const handleDeleteReporte = async (id_reporte) => {
    const result = await Swal.fire({
      title: '¿Eliminar reporte?',
      text: '¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/reports/${id_reporte}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el reporte');
      }

      await fetchData();
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El reporte ha sido eliminado correctamente.',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ffc107',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      setError(err.message);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el reporte',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ffc107'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsResolved = async (id_reporte) => {
    const result = await Swal.fire({
      title: '¿Marcar como resuelto?',
      text: '¿Estás seguro de que este reporte ha sido resuelto?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, marcar como resuelto',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Encontrar el reporte actual
      const reporteActual = reportesData.find(r => r.id_reporte === id_reporte);
      if (!reporteActual) {
        throw new Error('Reporte no encontrado');
      }

      const response = await fetch(`http://localhost:3001/api/reports/${id_reporte}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_reporte: reporteActual.id_reporte,
          descripcion: reporteActual.descripcion + ' [RESUELTO]',
          vehiculo: reporteActual.vehiculo,
          tipo_reporte: reporteActual.tipo_reporte
        })
      });

      if (!response.ok) {
        throw new Error('Error al marcar el reporte como resuelto');
      }

      await fetchData();
      Swal.fire({
        title: '¡Marcado como resuelto!',
        text: 'El reporte ha sido marcado como resuelto.',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ffc107',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      setError(err.message);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo marcar el reporte como resuelto',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ffc107'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateStats = () => {
    const totalReportes = reportesData.length;
    const reportesPendientes = reportesData.filter(r => !r.descripcion?.includes('[RESUELTO]')).length;
    const reportesResueltos = reportesData.filter(r => r.descripcion?.includes('[RESUELTO]')).length;
    const reportesHoy = reportesData.filter(r => {
      const hoy = new Date().toDateString();
      const fechaReporte = new Date(r.fecha_reporte).toDateString();
      return hoy === fechaReporte;
    }).length;

    return { totalReportes, reportesPendientes, reportesResueltos, reportesHoy };
  };

  const { totalReportes, reportesPendientes, reportesResueltos, reportesHoy } = calculateStats();

  if (loading) {
    return (
      <LayoutBarButton>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
          <Spinner animation="border" variant="warning" />
          <span className="ms-3">Cargando reportes...</span>
        </div>
      </LayoutBarButton>
    );
  }

  return (
    <LayoutBarButton>
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>
          <FaBell className="me-2" />
          Notificaciones y Reportes
        </h1>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4">
          <pre>{error}</pre>
        </Alert>
      )}

      {/* Estadísticas de reportes */}
      <Row className="stats-cards mb-4">
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon orange">
                  <FaBell />
                </div>
                <div>
                  <h4 className="stats-number">{totalReportes}</h4>
                  <div className="stats-label">Total Reportes</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon text-warning">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <h4 className="stats-number">{reportesPendientes}</h4>
                  <div className="stats-label">Pendientes</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon text-success">
                  <FaCheck />
                </div>
                <div>
                  <h4 className="stats-number">{reportesResueltos}</h4>
                  <div className="stats-label">Resueltos</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-4">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon text-info">
                  <FaCalendarAlt />
                </div>
                <div>
                  <h4 className="stats-number">{reportesHoy}</h4>
                  <div className="stats-label">Hoy</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de reportes */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Lista de Reportes ({reportesData.length})</h5>
        </Card.Header>
        <Card.Body>
          {reportesData.length === 0 ? (
            <div className="text-center py-5">
              <FaBell size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No hay reportes registrados</h5>
              <p className="text-muted">Los reportes aparecerán aquí cuando los usuarios los envíen.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Vehículo</th>
                    <th>Descripción</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reportesData.map((reporte) => {
                    const isResolved = reporte.descripcion?.includes('[RESUELTO]');
                    return (
                      <tr key={reporte.id_reporte} className={isResolved ? 'table-success' : ''}>
                        <td>
                          <span className="fw-bold">{reporte.id_reporte}</span>
                        </td>
                        <td>
                          {getTipoReporteBadge(reporte.tipo_reporte)}
                        </td>
                        <td>
                          <small className="text-muted">
                            {getVehiculoDescription(reporte.vehiculo)}
                          </small>
                        </td>
                        <td>
                          <div style={{ maxWidth: '200px' }}>
                            <span className="text-truncate d-block" title={reporte.descripcion}>
                              {reporte.descripcion?.replace('[RESUELTO]', '')}
                            </span>
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">
                            <FaCalendarAlt className="me-1" />
                            {formatFecha(reporte.fecha_reporte)}
                          </small>
                        </td>
                        <td>
                          {isResolved ? (
                            <Badge bg="success">
                              <FaCheck className="me-1" />
                              Resuelto
                            </Badge>
                          ) : (
                            <Badge bg="warning">
                              <FaExclamationTriangle className="me-1" />
                              Pendiente
                            </Badge>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleViewReporte(reporte)}
                              title="Ver detalles"
                              disabled={isSubmitting}
                            >
                              <FaEye />
                            </Button>
                            {!isResolved && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleMarkAsResolved(reporte.id_reporte)}
                                title="Marcar como resuelto"
                                disabled={isSubmitting}
                              >
                                <FaCheck />
                              </Button>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteReporte(reporte.id_reporte)}
                              title="Eliminar reporte"
                              disabled={isSubmitting}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para ver detalles del reporte */}
      <Modal show={showModal} onHide={() => !isSubmitting && setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEye className="me-2" />
            Detalles del Reporte #{selectedReporte?.id_reporte}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReporte && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Tipo de Reporte:</strong>
                  <div className="mt-1">
                    {getTipoReporteBadge(selectedReporte.tipo_reporte)}
                  </div>
                </Col>
                <Col md={6}>
                  <strong>Fecha:</strong>
                  <div className="mt-1 text-muted">
                    <FaCalendarAlt className="me-1" />
                    {formatFecha(selectedReporte.fecha_reporte)}
                  </div>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Vehículo:</strong>
                  <div className="mt-1 text-muted">
                    <FaCar className="me-1" />
                    {getVehiculoDescription(selectedReporte.vehiculo)}
                  </div>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Estado:</strong>
                  <div className="mt-1">
                    {selectedReporte.descripcion?.includes('[RESUELTO]') ? (
                      <Badge bg="success">
                        <FaCheck className="me-1" />
                        Resuelto
                      </Badge>
                    ) : (
                      <Badge bg="warning">
                        <FaExclamationTriangle className="me-1" />
                        Pendiente
                      </Badge>
                    )}
                  </div>
                </Col>
              </Row>
              
              <Row>
                <Col md={12}>
                  <strong>Descripción:</strong>
                  <div className="mt-2 p-3 bg-light rounded">
                    {selectedReporte.descripcion?.replace('[RESUELTO]', '')}
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            disabled={isSubmitting}
          >
            Cerrar
          </Button>
          {selectedReporte && !selectedReporte.descripcion?.includes('[RESUELTO]') && (
            <Button 
              variant="success" 
              onClick={() => {
                setShowModal(false);
                handleMarkAsResolved(selectedReporte.id_reporte);
              }}
              disabled={isSubmitting}
            >
              <FaCheck className="me-1" />
              Marcar como Resuelto
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </LayoutBarButton>
  );
};

export default NotificacionesAdmin;