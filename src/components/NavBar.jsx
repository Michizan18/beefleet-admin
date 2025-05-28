import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { FaTachometerAlt, FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = ({ notifications = 5 }) => {
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="admin-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">Sistema Administrativo</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard" className="nav-link-item">
              <FaTachometerAlt className="nav-icon" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/profile" className="nav-link-item active">
              <FaUser className="nav-icon" /> Perfil
            </Nav.Link>
            <Nav.Link as={Link} to="/notifications" className="nav-link-item">
              <div className="notification-container">
                <FaBell className="nav-icon" /> 
                Notificaciones
                {notifications > 0 && (
                  <Badge bg="danger" pill className="notification-badge">
                    {notifications}
                  </Badge>
                )}
              </div>
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/logout" className="nav-link-item">
              <FaSignOutAlt className="nav-icon" /> Cerrar Sesión
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;