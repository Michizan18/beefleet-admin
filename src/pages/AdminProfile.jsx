import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaUsers, FaIdCard, FaEdit, FaSave } from 'react-icons/fa';
import LayoutBarButton from "../components/LayoutBarButton";
import './AdminProfile.css';

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState(3);
  
  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const id_usuario = await localStorage.getItem('id_usuario');
      console.log(id_usuario)
      const response = await fetch(`http://localhost:3001/api/admin/${id_usuario}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('Token')}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      console.log(data)
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulación de retraso de red
    
      
      setAdmin(data);
      setEditForm(data); // También inicializamos el formulario con los datos actuales
      setError(null);
    } catch (err) {
      console.error("Error al cargar datos del perfil:", err);
      setError("No se pudo cargar la información del perfil. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Función para manejar la apertura del modal de edición
  const handleEditClick = () => {
    setEditForm(admin); // Aseguramos que el formulario tenga los datos actuales
    setSaveSuccess(false); // Reseteamos el estado de éxito
    setShowEditModal(true);
  };

  // Función para manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para guardar los cambios del perfil
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // En un caso real, aquí enviarías los datos al servidor
      // const response = await fetch('http://tu-servidor.com/api/admin/update-profile.php', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify(editForm)
      // });
      
      // Simulación de demora en la petición
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizamos el estado local con los nuevos datos
      setAdmin(editForm);
      setSaveSuccess(true);
      
      // Cerramos el modal después de 1.5 segundos para mostrar el mensaje de éxito
      setTimeout(() => {
        setShowEditModal(false);
      }, 1500);
      
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
      // Aquí podrías manejar el error, por ejemplo mostrando un mensaje
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <LayoutBarButton notifications={notifications} />
        <Container className="my-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando información del perfil...</p>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <LayoutBarButton notifications={notifications} />
        <Container className="my-5">
          <div className="alert alert-danger" role="alert">
            {error}
            <Button 
              variant="outline-danger" 
              size="sm" 
              className="ms-3"
              onClick={fetchAdminProfile}
            >
              Reintentar
            </Button>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <layoutBarButton userData={notifications} />
      <Container className="my-5 profile-container">
        <h1 className="text-center mb-5">Perfil de Administrador</h1>
        
        {admin && (
          <>
            <Row>
              <Col lg={4} md={5}>
                <Card className="profile-card">
                  <div className="profile-header text-center">
                    <h3 className='mt-5 text-white'>{admin.nombre_usuario}</h3>
                  </div>
                  <Card.Body className="text-center">
                    <div className="mb-3">
                      <Badge bg={admin.estado === 'Activo' ? 'success' : 'danger'} className="px-3 py-2">
                        {admin.estado}
                      </Badge>
                    </div>
                    <h5>
                      <Badge bg="primary" className="w-100 py-2">{admin.rol}</Badge>
                    </h5>
                    
                    <div className="profile-info mt-4">
                      <div className="info-item">
                        <FaUsers className="info-icon" />
                        <span>
                          <strong>{admin.empleadosACargo}</strong> empleados a cargo
                        </span>
                      </div>
                      <div className="info-item">
                        <FaClock className="info-icon" />
                        <span>
                          Último acceso:<br />
                          <strong>{formatDate(admin.ultimoAcceso)}</strong>
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline-primary" 
                      className="mt-4 w-100"
                      onClick={handleEditClick}
                    >
                      <FaEdit className="me-2" /> Editar Perfil
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col lg={8} md={7}>
                <Card className="mb-4">
                  <Card.Header>
                    <h4 className="mb-0">Información Personal</h4>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive borderless className="admin-table">
                      <tbody>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="icon-container">
                                <FaUser />
                              </div>
                              <div>
                                <strong>Nombre Completo</strong>
                              </div>
                            </div>
                          </td>
                          <td>{admin.nombre}</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="icon-container">
                                <FaIdCard />
                              </div>
                              <div>
                                <strong>Documento</strong>
                              </div>
                            </div>
                          </td>
                          <td>{admin.documento}</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="icon-container">
                                <FaEnvelope />
                              </div>
                              <div>
                                <strong>Correo Electrónico</strong>
                              </div>
                            </div>
                          </td>
                          <td>{admin.correo}</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="icon-container">
                                <FaPhone />
                              </div>
                              <div>
                                <strong>Teléfono</strong>
                              </div>
                            </div>
                          </td>
                          <td>{admin.telefono}</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="icon-container">
                                <FaMapMarkerAlt />
                              </div>
                              <div>
                                <strong>Dirección</strong>
                              </div>
                            </div>
                          </td>
                          <td>{admin.direccion}</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="icon-container">
                                <FaUsers />
                              </div>
                              <div>
                                <strong>Empleados a Cargo</strong>
                              </div>
                            </div>
                          </td>
                          <td>{admin.empleadosACargo}</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="icon-container">
                                <FaClock />
                              </div>
                              <div>
                                <strong>Fecha de Contratación</strong>
                              </div>
                            </div>
                          </td>
                          <td>{new Date(admin.fechaContratacion).toLocaleDateString('es-ES')}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
                
                <Card>
                  <Card.Header>
                    <h4 className="mb-0">Permisos del Sistema</h4>
                  </Card.Header>
                  <Card.Body>
                    <div className="permissions-container">
                      {admin.permisos.map((permiso, index) => (
                        <Badge 
                          bg="info" 
                          className="permission-badge" 
                          key={index}
                        >
                          {permiso}
                        </Badge>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Row className="mt-4">
              <Col>
                <Card>
                  <Card.Header>
                    <h4 className="mb-0">Actividad Reciente</h4>
                  </Card.Header>
                  <Card.Body>
                    <div className="activity-timeline">
                      <div className="activity-item">
                        <div className="activity-dot bg-success"></div>
                        <div className="activity-content">
                          <div className="activity-date">{formatDate(new Date())}</div>
                          <div className="activity-text">Inició sesión desde la IP 192.168.1.25</div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-dot bg-primary"></div>
                        <div className="activity-content">
                          <div className="activity-date">{formatDate(new Date(Date.now() - 86400000))}</div>
                          <div className="activity-text">Actualizó la información de 3 empleados</div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-dot bg-warning"></div>
                        <div className="activity-content">
                          <div className="activity-date">{formatDate(new Date(Date.now() - 172800000))}</div>
                          <div className="activity-text">Generó reportes mensuales de productividad</div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            {/* Modal para editar el perfil */}
            <Modal 
              show={showEditModal} 
              onHide={() => setShowEditModal(false)} 
              size="lg"
              backdrop="static"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Editar Perfil</Modal.Title>
              </Modal.Header>
              <Form onSubmit={handleSaveProfile}>
                <Modal.Body>
                  {saveSuccess && (
                    <div className="alert alert-success" role="alert">
                      ¡Perfil actualizado correctamente!
                    </div>
                  )}
                  
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Nombre Completo</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="nombre" 
                          value={editForm.nombre || ''} 
                          onChange={handleFormChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Documento</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="documento" 
                          value={editForm.documento || ''} 
                          onChange={handleFormChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Correo Electrónico</Form.Label>
                        <Form.Control 
                          type="email" 
                          name="correo" 
                          value={editForm.correo || ''} 
                          onChange={handleFormChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control 
                          type="tel" 
                          name="telefono" 
                          value={editForm.telefono || ''} 
                          onChange={handleFormChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="direccion" 
                      value={editForm.direccion || ''} 
                      onChange={handleFormChange}
                      required
                    />
                  </Form.Group>
                  
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Rol</Form.Label>
                        <Form.Select 
                          name="rol" 
                          value={editForm.rol || ''} 
                          onChange={handleFormChange}
                          required
                        >
                          <option value="Administrador General">Administrador General</option>
                          <option value="Administrador de Recursos Humanos">Administrador de Recursos Humanos</option>
                          <option value="Administrador Financiero">Administrador Financiero</option>
                          <option value="Administrador de TI">Administrador de TI</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Estado</Form.Label>
                        <Form.Select 
                          name="estado" 
                          value={editForm.estado || ''} 
                          onChange={handleFormChange}
                          required
                        >
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                          <option value="Suspendido">Suspendido</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" /> Guardar Cambios
                      </>
                    )}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal>
          </>
        )}
      </Container>
    </>
  );
};

export default AdminProfile;