// LoginForm.jsx

import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import './LoginForm.css'; 

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Aquí simularíamos la conexión con la base de datos
      // En un caso real, esto sería una petición fetch o axios a tu backend
      const response = await loginUser(email, password);
      
      if (response.success) {
        setSuccess(true);
        // Aquí guardaríamos el token en localStorage o sessionStorage
        localStorage.setItem('authToken', response.token);
        // Redireccionar después del login exitoso
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setError(response.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Función simulada de login - En un caso real, esto sería una petición API
  const loginUser = async (email, password) => {
    // Simulamos un retraso de red
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Esta sería la lógica que implementarías para conectar con tu backend PHP
    // que a su vez se conectaría con phpMyAdmin/MySQL
    
    // Por ahora simulamos una respuesta
    if (email === 'usuario@ejemplo.com' && password === 'password123') {
      return {
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXN1YXJpb0BlamVtcGxvLmNvbSJ9',
        user: {
          id: 1,
          name: 'Usuario Ejemplo',
          email: 'usuario@ejemplo.com'
        }
      };
    } else {
      return {
        success: false,
        message: 'Credenciales inválidas'
      };
    }
  };

  return (
    <div className="login-container">
      <div className="container h-100">
        <div className="row h-100 justify-content-center align-items-center">
          <div className="col-md-6 col-lg-4">
            <Card className="transparent-card shadow-lg">
              <Card.Body>
                <h2 className="text-center mb-4 text-white">Iniciar Sesión</h2>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">¡Login exitoso! Redirigiendo...</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label className="text-white">Correo Electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Ingresa tu correo"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="transparent-input"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label className="text-white">Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="transparent-input"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formRemember">
                    <Form.Check 
                      type="checkbox" 
                      label="Recordarme" 
                      className="text-white"
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      variant="outline-light" 
                      type="submit" 
                      disabled={loading}
                      className="custom-button"
                    >
                      {loading ? 'Cargando...' : 'Iniciar Sesión'}
                    </Button>
                  </div>
                </Form>
                
                <div className="text-center mt-3">
                  <a href="/recuperar-password" className="text-white">¿Olvidaste tu contraseña?</a>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;