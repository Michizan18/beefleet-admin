import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { 
  FaIdCard,  
  FaUserCircle, 
  FaSearch, FaUsers, 
  FaEdit, FaTrashAlt, FaPlus, FaSave,
  FaPhone, FaMapMarkerAlt, FaEnvelope,
  FaUser, FaLock, FaKey, FaClock, FaUserCog, FaTimes
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';

const AdminProfile = () => {
  // Estados principales
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  
  // Estados para modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Estados para formularios
  const [editForm, setEditForm] = useState({
    nombre_usuario: '',
    apellido_usuario: '',
    correo_usuario: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Estados de validación y guardado
  const [editErrors, setEditErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const processMySQLResponse = useCallback((rawData) => {
      try {
        if (!rawData) return [];
        
        if (Array.isArray(rawData)) {
          // Si es un array de arrays (resultado directo de MySQL)
          if (rawData.length > 0 && Array.isArray(rawData[0])) {
            return rawData[0].filter(item => item?.id_usuario);
          }
          // Si es un array simple de objetos cliente
          return rawData.filter(item => item?.id_usuario);
        }
        
        // Si es un solo objeto cliente
        if (rawData?.id_usuario) {
          return [rawData];
        }
        
        return [];
      } catch (error) {
        console.error('Error processing MySQL response:', error);
        return [];
      }
    }, []);

  // Función para obtener el token de autenticación
const getAuthToken = useCallback(() => {
  const token = localStorage.getItem('token');
  const id_usuario = localStorage.getItem('id_usuario');
  
  console.log('Token from storage:', token); // Debug
  console.log('ID from storage:', id_usuario); // Debug
  
  if (!token || !id_usuario) {
    console.error('Missing authentication data in localStorage');
    return null;
  }
  
  return {
    token: `Bearer ${token}`,
    id_usuario: id_usuario
  };
}, []);

  // Función para obtener los datos del perfil del administrador
  const fetchAdminProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      const id_usuario = localStorage.getItem('id_usuario');
      
      console.log('Token:', token); // Debug
      console.log('ID Usuario:', id_usuario); // Debug
      
      if (!token || !id_usuario) {
        setError('No hay información de autenticación');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`http://localhost:3001/api/users`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status); // Debug
      console.log('Response ok:', response.ok); // Debug
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('id_usuario');
          setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
          return;
        }
        
        // Obtener texto del error para más información
        const errorText = await response.text();
        console.error('Error response:', errorText); // Debug
        throw new Error(`Error ${response.status}: ${errorText || 'Error al obtener los datos del perfil'}`);
      }

      const data = await response.json();
      console.log('Data received:', data); // Debug
      setAdminData(data);
      
      // Inicializar el formulario de edición con los datos actuales
      setEditForm({
        nombre_usuario: data.nombre_usuario || '',
        apellido_usuario: data.apellido_usuario || '',
        correo_usuario: data.correo_usuario || '' 
      });
      
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      setError(`Error al cargar el perfil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  // Función para actualizar el perfil
  const updateProfile = useCallback(async (profileData) => {
    try {
      const token = getAuthToken();
      const id_usuario = localStorage.getItem('id_usuario');
      
      console.log('Updating profile with data:', profileData); // Debug
      
      const response = await fetch(`http://localhost:3001/api/users/${id_usuario}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update error:', errorText); // Debug
        throw new Error(errorText || 'Error al actualizar el perfil');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [getAuthToken]);

  // Función para cambiar contraseña
  const changePassword = useCallback(async (passwordData) => {
    try {
      const token = getAuthToken();
      const id_usuario = localStorage.getItem('id_usuario');
      
      const response = await fetch(`http://localhost:3001/api/users/${id_usuario}/password`, {
        method: 'PATCH',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al cambiar la contraseña');
      }

      return await response.json();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }, [getAuthToken]);

  // Validaciones
  const validateEditForm = () => {
    const errors = {};
    
    if (!editForm.nombre_usuario.trim()) {
      errors.nombre_usuario = 'El nombre es obligatorio';
    }
    
    if (!editForm.apellido_usuario.trim()) {
      errors.apellido_usuario = 'El apellido es obligatorio';
    }
    
    if (!editForm.correo_usuario.trim()) {
      errors.correo_usuario = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.correo_usuario)) {
      errors.correo_usuario = 'Formato de correo inválido';
    }
    
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.current_password) {
      errors.current_password = 'La contraseña actual es obligatoria';
    }
    
    if (!passwordForm.new_password) {
      errors.new_password = 'La nueva contraseña es obligatoria';
    } else if (passwordForm.new_password.length < 6) {
      errors.new_password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!passwordForm.confirm_password) {
      errors.confirm_password = 'Debe confirmar la nueva contraseña';
    } else if (passwordForm.new_password !== passwordForm.confirm_password) {
      errors.confirm_password = 'Las contraseñas no coinciden';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Efecto para cargar el perfil al montar el componente
  useEffect(() => {
    fetchAdminProfile();
  }, [fetchAdminProfile]);

  // Handlers para formularios
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Submit para editar perfil
  const handleSubmitEditProfile = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }
    
    try {
      setSaving(true);
      await updateProfile(editForm);
      await fetchAdminProfile(); // Recargar datos
      
      setShowEditModal(false);
      setEditErrors({});
      setError(null);
      
      // Mostrar mensaje de éxito
      alert('Perfil actualizado correctamente');
    } catch (error) {
      setError(`Error al actualizar el perfil: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Submit para cambiar contraseña
  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setSaving(true);
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      
      setShowPasswordModal(false);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setPasswordErrors({});
      setError(null);
      
      alert('Contraseña actualizada correctamente');
    } catch (error) {
      setError(`Error al cambiar la contraseña: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handlers para abrir modales
  const handleEditClick = () => {
    setError(null);
    setEditErrors({});
    setShowEditModal(true);
  };

  const handlePasswordClick = () => {
    setError(null);
    setPasswordErrors({});
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setShowPasswordModal(true);
  };

  // Handlers para cerrar modales
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditErrors({});
    setError(null);
    // Restaurar valores originales
    if (adminData) {
      setEditForm({
        nombre_usuario: adminData.nombre_usuario || '',
        apellido_usuario: adminData.apellido_usuario || '',
        correo_usuario: adminData.correo_usuario || adminData.correo_usuario || ''
      });
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordErrors({});
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setError(null);
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <LayoutBarButton userData={userData}>
      <div className="page-header d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Mi Perfil de Administrador</h1>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {/* Tarjeta de perfil */}
      <Card className="mb-4">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaUser className="text-warning me-2" size={20} />
              <h5 className="mb-0">Información del Perfil</h5>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : adminData ? (
            <Row>
              <Col md={4} className="text-center mb-4 mb-md-0">
                <div className="mb-3">
                  <div 
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: '150px', height: '150px' }}
                  >
                    <FaUserCircle className="text-warning" size={80} />
                  </div>
                </div>
                <h4 className="mb-1">
                  {adminData.nombre_usuario} {adminData.apellido_usuario}
                </h4>
                <p className="text-muted">
                  <Badge bg="info">Administrador</Badge>
                </p>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6}>
                    <h5 className="border-bottom pb-2 mb-3">
                      <FaUser className="me-2 text-warning" />
                      Información Personal
                    </h5>
                    
                    <div className="mb-3">
                      <p className="mb-1"><strong>ID de Usuario:</strong></p>
                      <p>{adminData.id_usuario}</p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="mb-1"><strong>Nombre:</strong></p>
                      <p>{adminData.nombre_usuario}</p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="mb-1"><strong>Apellido:</strong></p>
                      <p>{adminData.apellido_usuario}</p>
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <h5 className="border-bottom pb-2 mb-3">
                      <FaUserCog className="me-2 text-warning" />
                      Información de Cuenta
                    </h5>
                    
                    <div className="mb-3">
                      <p className="mb-1"><strong>Correo Electrónico:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaEnvelope className="me-2 text-warning" />
                        {adminData.correo_usuario || ''}
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="mb-1"><strong>Fecha de Registro:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaClock className="me-2 text-warning" />
                        {formatDate(adminData.fecha_creacion)}
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="mb-1"><strong>Última Actualización:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaClock className="me-2 text-warning" />
                        {formatDate(adminData.fecha_actualizacion)}
                      </p>
                    </div>
                  </Col>
                </Row>
                
                <div className="mt-4 pt-3 border-top">
                  <Button 
                    variant="warning" 
                    className="me-2"
                    onClick={handleEditClick}
                  >
                    <FaEdit className="me-2" /> Editar Perfil
                  </Button>
                  <Button 
                    variant="outline-warning"
                    onClick={handlePasswordClick}
                  >
                    <FaKey className="me-2" /> Cambiar Contraseña
                  </Button>
                </div>
              </Col>
            </Row>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron datos del perfil.</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal para editar perfil */}
      <Modal 
        show={showEditModal} 
        onHide={handleCloseEditModal}
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>
            <FaEdit className="me-2 text-warning" />
            Editar Perfil
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitEditProfile}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre_usuario"
                value={editForm.nombre_usuario}
                onChange={handleEditInputChange}
                isInvalid={!!editErrors.nombre_usuario}
                required
              />
              <Form.Control.Feedback type="invalid">
                {editErrors.nombre_usuario}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Apellido</Form.Label>
              <Form.Control
                type="text"
                name="apellido_usuario"
                value={editForm.apellido_usuario}
                onChange={handleEditInputChange}
                isInvalid={!!editErrors.apellido_usuario}
                required
              />
              <Form.Control.Feedback type="invalid">
                {editErrors.apellido_usuario}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                name="correo_usuario"
                value={editForm.correo_usuario}
                onChange={handleEditInputChange}
                isInvalid={!!editErrors.correo_usuario}
                required
              />
              <Form.Control.Feedback type="invalid">
                {editErrors.correo_usuario}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancelar
          </Button>
          <Button 
            variant="warning" 
            onClick={handleSubmitEditProfile}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Guardando...</span>
                </div>
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para cambiar contraseña */}
      <Modal 
        show={showPasswordModal} 
        onHide={handleClosePasswordModal}
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>
            <FaLock className="me-2 text-warning" />
            Cambiar Contraseña
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitPasswordChange}>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña Actual</Form.Label>
              <Form.Control
                type="password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordInputChange}
                isInvalid={!!passwordErrors.current_password}
                required
              />
              <Form.Control.Feedback type="invalid">
                {passwordErrors.current_password}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordInputChange}
                isInvalid={!!passwordErrors.new_password}
                required
              />
              <Form.Control.Feedback type="invalid">
                {passwordErrors.new_password}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Confirmar Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordInputChange}
                isInvalid={!!passwordErrors.confirm_password}
                required
              />
              <Form.Control.Feedback type="invalid">
                {passwordErrors.confirm_password}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePasswordModal}>
            Cancelar
          </Button>
          <Button 
            variant="warning" 
            onClick={handleSubmitPasswordChange}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Actualizando...</span>
                </div>
                Actualizando...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                Cambiar Contraseña
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </LayoutBarButton>
  );
};

export default AdminProfile;