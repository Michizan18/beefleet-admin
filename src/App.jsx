import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './components/LoginForm'
import Dashboard from './pages/Dashboard'; 
import AdminProfile from './components/AdminProfile';
import Conductores from './pages/Conductores';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="/conductores" element={<Conductores/>} />
      </Routes>
    </Router>
  )
}

export default App
