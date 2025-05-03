import './css/App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inventario from './Inventario';
import Home from './Home';
import Navbar from './components/Navbar';
import Login from './components/Login';
import AgregarProveedor from './AgregarProveedor'; 
import Usuarios from './pages/Usuarios';
import Configuracion from './Configuracion';
import { jwtDecode } from 'jwt-decode';
import Ventas from './pages/Ventas';
import useAutoLogout from './useAutoLogout';
import Caja from './pages/Caja'; // 👈 Agrega la importación

// Componente que llama al hook una vez dentro del contexto del Router
function AutoLogoutHandler() {
  useAutoLogout(); // Aquí sí es seguro usar useNavigate()
  return null;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const token = localStorage.getItem('token');

  const getUserIdFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.userId;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const userId = getUserIdFromToken(token);
      setUsuarioId(userId);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    const token = localStorage.getItem('token');
    if (token) {
      const userId = getUserIdFromToken(token);
      setUsuarioId(userId);
    }
  };

  return (
    <Router>
      <AutoLogoutHandler /> {/* Hook ahora está dentro del contexto del Router */}
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <div>
                <h1>Bienvenido al sistema de punto de venta</h1>
              </div>
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route path="/inventario" element={isAuthenticated ? <Inventario usuarioId={usuarioId} /> : <Login onLogin={handleLogin} />} />
        <Route path="/agregar-proveedor" element={isAuthenticated ? <AgregarProveedor /> : <Login onLogin={handleLogin} />} />
        <Route path="/usuarios" element={isAuthenticated ? <Usuarios /> : <Login onLogin={handleLogin} />} />
        <Route path="/configuracion" element={isAuthenticated ? <Configuracion /> : <Login onLogin={handleLogin} />} />
        <Route path="/ventas" element={isAuthenticated ? <Ventas /> : <Login onLogin={handleLogin} />} />
        <Route path="/caja" element={isAuthenticated ? <Caja /> : <Login onLogin={handleLogin} />} />
      </Routes>
    </Router>
  );
}

export default App;