import './css/App.css';
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Inventario from './Inventario';
import AgregarProveedor from './AgregarProveedor'; 
import Usuarios from './pages/Usuarios';
import Configuracion from './Configuracion';
import Ventas from './pages/Ventas';
import Caja from './pages/Caja';
import Navbar from './components/Navbar';
import Login from './components/Login';
import AutoLogoutModal from './components/AutoLogoutModal';
import { jwtDecode } from 'jwt-decode';
import useAutoLogout from './useAutoLogout';
import Entradas from './pages/Entradas';
import Salidas from './pages/Salidas';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [usuarioAuth, setUsuarioAuth] = useState({ id: null, nombre: '', rol: '' });

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsuarioAuth({
          id: decoded.id,
          nombre: decoded.nombre,
          rol: decoded.rol,
          correo: decoded.correo
        });
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Token inválido', e);
        localStorage.removeItem('token');
      }
    }
    setLoadingAuth(false);
  }, []);

  const handleLogin = () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        setUsuarioAuth({
          id: decoded.id,
          nombre: decoded.nombre,
          rol: decoded.rol,
        });
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Token inválido', e);
      }
    }
  };

  const { showWarning, setShowWarning, resetTimers } = useAutoLogout(
    5 * 60 * 1000,
    60 * 1000,
    isAuthenticated ? handleLogout : null
  );

  if (loadingAuth) {
    return <div>Cargando sesión...</div>;
  }

  return (
    <>
      {isAuthenticated && <Navbar />}
      {showWarning && (
        <AutoLogoutModal
          nombre={usuarioAuth.nombre}
          correo={usuarioAuth.correo}
          onStay={() => {
            resetTimers();
            setShowWarning(false);
          }}
          onLogout={handleLogout}
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <div style={{ padding: '20px', fontSize: '20px' }}>
                Hola, <strong>{usuarioAuth.nombre || 'Cargando...'}</strong>. Bienvenido al sistema.
              </div>
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route path="/inventario" element={isAuthenticated ? <Inventario usuarioId={usuarioAuth.id} /> : <Navigate to="/login" />} />
        <Route path="/agregar-proveedor" element={isAuthenticated ? <AgregarProveedor /> : <Navigate to="/login" />} />
        <Route path="/usuarios" element={isAuthenticated ? <Usuarios /> : <Navigate to="/login" />} />
        <Route path="/configuracion" element={isAuthenticated ? <Configuracion /> : <Navigate to="/login" />} />
        <Route path="/ventas" element={isAuthenticated ? <Ventas /> : <Navigate to="/login" />} />
        <Route path="/caja" element={isAuthenticated ? <Caja /> : <Navigate to="/login" />} />

        {/* ✅ Nuevas rutas de entradas y salidas protegidas */}
        <Route path="/entradas" element={isAuthenticated ? <Entradas /> : <Navigate to="/login" />} />
        <Route path="/salidas" element={isAuthenticated ? <Salidas /> : <Navigate to="/login" />} />

        <Route path="/login" element={<Login onLogin={handleLogin} />} />
      </Routes>
    </>
  );
}

export default AppWrapper;