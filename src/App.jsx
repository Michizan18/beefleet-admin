import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './pages/LoginForm'
import Dashboard from './pages/Dashboard'; 
import Conductores from './pages/Conductores';
import Rutas from './pages/Rutas';
import NotificacionesAdmin from './pages/NotificacionesAdmin';
import Vehiculos from './pages/Vehiculos'; 
import Cargas from './pages/Cargas';

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
      </Routes>
    </Router>
  )
}

export default App