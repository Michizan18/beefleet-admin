import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import './LoginForm.css';

const RecuperarContraseña = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState('request'); // 'request' | 'sent'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3001/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setStep('sent');
        console.log('Email enviado exitosamente:', data);
      } else {
        setError(data.message || 'Error al enviar el correo de recuperación');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/login'; // O usar React Router si lo tienes configurado
  };

  if (step === 'sent') {
    return (
      <div className="login-container">
        <div className="container h-100">
          <div className="row h-100 justify-content-center align-items-center">
            <div className="col-md-6 col-lg-4">
              <Card className="transparent-card shadow-lg">
                <Card.Body className="text-center">
                  <div className="mb-4">
                    <i className="fas fa-envelope-circle-check fa-3x text-success mb-3"></i>
                    <h2 className="text-white mb-3">¡Correo Enviado!</h2>
                    <p className="text-white mb-4">
                      Se ha enviado un enlace de recuperación a <strong>{email}</strong>
                    </p>
                    <p className="text-white-50 small mb-4">
                      Revisa tu bandeja de entrada y spam. El enlace expirará en 1 hora.
                    </p>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <Button
                      variant="outline-light"
                      onClick={handleBackToLogin}
                      className="custom-button"
                    >
                      Volver al Login
                    </Button>
                    <Button
                      variant="link"
                      className="text-white-50 small"
                      onClick={() => {
                        setStep('request');
                        setEmail('');
                        setSuccess(false);
                      }}
                    >
                      ¿No recibiste el correo? Intentar de nuevo
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="container h-100">
        <div className="row h-100 justify-content-center align-items-center">
          <div className="col-md-6 col-lg-4">
            <Card className="transparent-card shadow-lg">
              <Card.Body>
                <div className="text-center mb-4">
                  <i className="fas fa-key fa-2x text-white mb-3"></i>
                  <h2 className="text-white">Recuperar Contraseña</h2>
                  <p className="text-white-50 small">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
                  </p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label className="text-white">Correo Electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="transparent-input"
                    />
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button
                      variant="outline-light"
                      type="submit"
                      disabled={loading}
                      className="custom-button"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Enviando...
                        </>
                      ) : (
                        'Enviar Enlace de Recuperación'
                      )}
                    </Button>
                    
                    <Button
                      variant="link"
                      className="text-white-50"
                      onClick={handleBackToLogin}
                    >
                      Volver al Login
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarContraseña;