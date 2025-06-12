import React, { useState, useEffect } from 'react';

const MiPerfil = () => {
  const [profile, setProfile] = useState({
    id_usuario: '',
    nombre_usuario: '',
    apellido_usuario: '',
    correo_usuario: '',
    contraseña: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    console.log('🚀 INICIANDO fetchProfile...');
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa. Por favor, inicia sesión.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar el perfil');
      }

      const data = await response.json();
      console.log('📦 Datos del perfil recibidos:', data);
      
      setProfile({
        id_usuario: data.id_usuario || '',
        nombre_usuario: data.nombre_usuario || '',
        apellido_usuario: data.apellido_usuario || '',
        correo_usuario: data.correo_usuario || '',
        contraseña: data.contraseña || ''
      });
      
    } catch (err) {
      console.error("❌ Error al cargar perfil:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile();
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/users/${profile.id_usuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre_usuario: profile.nombre_usuario,
          apellido_usuario: profile.apellido_usuario,
          correo_usuario: profile.correo_usuario,
          contraseña: profile.contraseña
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el perfil');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/users/${profile.id_usuario}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el perfil');
      }

      localStorage.removeItem('token');
      window.location.href = '/login';
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getInitials = () => {
    return `${profile.nombre_usuario?.charAt(0) || ''}${profile.apellido_usuario?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #ff8c00',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <span style={{ marginTop: '15px', color: '#666' }}>Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      {/* Header con título - mismo estilo que Ventas */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#2c3e50',
          margin: 0
        }}>
          Mi Perfil
        </h1>
      </div>

      {/* Mensaje de error - mismo estilo que Ventas */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px 16px',
          borderRadius: '6px',
          border: '1px solid #f5c6cb',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#721c24',
              padding: '0',
              marginLeft: '10px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Contenedor principal - mismo estilo que Ventas */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header del perfil con gradiente naranja */}
        <div style={{
          background: 'linear-gradient(135deg, #ff8c00, #ff6600)',
          padding: '40px 30px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '15px'
          }}>
            {getInitials() || '👤'}
          </div>
          <h2 style={{
            color: 'white',
            marginBottom: '5px',
            fontWeight: '600',
            fontSize: '1.8rem'
          }}>
            {profile.nombre_usuario} {profile.apellido_usuario}
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1rem',
            marginBottom: '0'
          }}>
            ID: {profile.id_usuario}
          </p>
        </div>

        {/* Sección de información personal */}
        <div style={{ padding: '30px' }}>
          {/* Header de la sección con botones */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#ff8c00',
                color: 'white',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                fontSize: '14px'
              }}>
                👤
              </div>
              <h3 style={{
                color: '#2c3e50',
                fontWeight: '600',
                margin: '0',
                fontSize: '1.25rem'
              }}>
                Información Personal
              </h3>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {!isEditing ? (
                <>
                  <button
                    style={{
                      backgroundColor: '#ff8c00',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontWeight: '500',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px'
                    }}
                    onClick={handleEdit}
                    disabled={isSubmitting}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    style={{
                      backgroundColor: 'transparent',
                      border: '2px solid #dc3545',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontWeight: '500',
                      color: '#dc3545',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px'
                    }}
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isSubmitting}
                  >
                    🗑️ Eliminar
                  </button>
                </>
              ) : (
                <>
                  <button
                    style={{
                      backgroundColor: '#28a745',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontWeight: '500',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px'
                    }}
                    onClick={handleSave}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '⏳ Guardando...' : '💾 Guardar'}
                  </button>
                  <button
                    style={{
                      backgroundColor: '#6c757d',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontWeight: '500',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px'
                    }}
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    ❌ Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div>
            {/* ID Usuario (Solo lectura) */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontWeight: '600',
                color: '#495057',
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                🆔 ID de Usuario
              </label>
              <input
                type="text"
                value={profile.id_usuario || ''}
                disabled
                style={{
                  width: '100%',
                  borderRadius: '6px',
                  border: '1px solid #ced4da',
                  padding: '12px 16px',
                  fontSize: '14px',
                  backgroundColor: '#e9ecef',
                  color: '#6c757d',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Nombre y Apellido */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  fontWeight: '600',
                  color: '#495057',
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  👤 Nombre
                </label>
                <input
                  type="text"
                  name="nombre_usuario"
                  value={profile.nombre_usuario || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    borderRadius: '6px',
                    border: isEditing ? '2px solid #ff8c00' : '1px solid #ced4da',
                    padding: '12px 16px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    backgroundColor: isEditing ? 'white' : '#f8f9fa',
                    boxSizing: 'border-box'
                  }}
                  required
                  maxLength={50}
                />
              </div>
              <div>
                <label style={{
                  fontWeight: '600',
                  color: '#495057',
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  👤 Apellido
                </label>
                <input
                  type="text"
                  name="apellido_usuario"
                  value={profile.apellido_usuario || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    borderRadius: '6px',
                    border: isEditing ? '2px solid #ff8c00' : '1px solid #ced4da',
                    padding: '12px 16px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    backgroundColor: isEditing ? 'white' : '#f8f9fa',
                    boxSizing: 'border-box'
                  }}
                  required
                  maxLength={50}
                />
              </div>
            </div>

            {/* Correo Electrónico */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontWeight: '600',
                color: '#495057',
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                📧 Correo Electrónico
              </label>
              <input
                type="email"
                name="correo_usuario"
                value={profile.correo_usuario || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  borderRadius: '6px',
                  border: isEditing ? '2px solid #ff8c00' : '1px solid #ced4da',
                  padding: '12px 16px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  backgroundColor: isEditing ? 'white' : '#f8f9fa',
                  boxSizing: 'border-box'
                }}
                required
                maxLength={100}
              />
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontWeight: '600',
                color: '#495057',
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                🔒 Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="contraseña"
                  value={profile.contraseña || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    borderRadius: '6px',
                    border: isEditing ? '2px solid #ff8c00' : '1px solid #ced4da',
                    padding: '12px 45px 12px 16px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    backgroundColor: isEditing ? 'white' : '#f8f9fa',
                    boxSizing: 'border-box'
                  }}
                  required
                  placeholder={!isEditing ? "••••••••" : "Nueva contraseña"}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    color: '#ff8c00',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {isEditing && (
                <small style={{
                  color: '#6c757d',
                  fontSize: '12px',
                  marginTop: '6px',
                  display: 'block'
                }}>
                  Deja en blanco si no deseas cambiar la contraseña
                </small>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #dc3545, #c82333)',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px'
            }}>
              🗑️
            </div>
            <h4 style={{
              color: '#2c3e50',
              fontWeight: '600',
              marginBottom: '12px',
              fontSize: '18px'
            }}>
              ¿Estás seguro?
            </h4>
            <p style={{
              color: '#6c757d',
              fontSize: '14px',
              lineHeight: '1.5',
              marginBottom: '25px'
            }}>
              Esta acción eliminará permanentemente tu perfil y no se puede deshacer.
              Se cerrará tu sesión automáticamente.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                style={{
                  backgroundColor: '#6c757d',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: '500',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={() => setShowDeleteModal(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                style={{
                  backgroundColor: '#dc3545',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: '500',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px'
                }}
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Eliminando...' : '🗑️ Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiPerfil;