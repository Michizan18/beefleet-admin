import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './pages/LoginForm'
import Dashboard from './pages/Dashboard'; 
import Conductores from './pages/Conductores';
import Rutas from './pages/Rutas';
import NotificacionesAdmin from './pages/NotificacionesAdmin';
import Vehiculos from './pages/Vehiculos'; 
import Cargas from './pages/Cargas';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';
import RecuperarContraseña from './components/RecuperarContraseña';
import MiPerfil from './components/MiPerfil';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/conductores" element={<Conductores/>} />
        <Route path="/rutas" element={<Rutas />} />
        <Route path="/notificaciones" element={<NotificacionesAdmin />} />
        <Route path="/vehiculos" element={<Vehiculos/>} /> 
        <Route path="/cargas" element={<Cargas/>} /> 
        <Route path="/clientes" element={<Clientes/>} />
        <Route path="/ventas" element={<Ventas/>} />
        <Route path="/recuperar-password" element={<RecuperarContraseña/>} />
        <Route path="/profile" element={<MiPerfil/>} />
        <Route path="/miperfil" element={<MiPerfil/>} />
      </Routes>
    </Router>
  )
}

export default App;