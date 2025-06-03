// LoginForm.jsx

import React , { useState } from 'react';
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
    try{
      const response = await fetch('http://localhost:3001/api/admin/',{
        method: 'POST',
        headers:{
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo_usuario: email,
          contraseña: password
        },)
      },)
      const data = await response.json();
      if (response.ok){
        setSuccess(true)
        await localStorage.setItem('token', data.token);
        await localStorage.setItem('usuario', JSON.stringify(data))
        setTimeout(()=>{
          window.location.href = '/dashboard';
        }, 1)
      }else{
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (err){
        setError('Error de conexión con el servidor');
        console.error(err);
    } finally {
        setLoading(false);
    }
  }

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