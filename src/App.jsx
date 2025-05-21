import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './components/LoginForm'
import Dashboard from './pages/Dashboard'; 
import AdminProfile from './components/AdminProfile';
import Conductores from './pages/Conductores';
import Vehiculos from './pages/Vehiculos'; // Importa el componente Vehiculos

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="/conductores" element={<Conductores/>} />
        <Route path="/vehiculos" element={<Vehiculos/>} /> {/* Agrega la ruta para vehículos */}
      </Routes>
    </Router>
  )
}

export default App