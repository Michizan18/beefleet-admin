import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './pages/LoginForm'
import Dashboard from './pages/Dashboard'; 
import AdminProfile from './pages/AdminProfile';
import Conductores from './pages/Conductores';
import Vehiculos from './pages/Vehiculos';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="/conductores" element={<Conductores/>} />
        <Route path="/vehiculos" element={<Vehiculos />} />
      </Routes>
    </Router>
  )
}
export default App
