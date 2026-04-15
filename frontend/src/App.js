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
import Reportes from './pages/Reportes';
import Dashboard from './pages/Dashboard';
import HistorialVentas from './pages/HistorialVentas';
import HistorialLogs from './HistorialLogs';
import Categorias from './pages/Categorias';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        const dest = decoded.rol === 'empleado' ? '/ventas' : '/dashboard';
        navigate(dest);
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
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--color-bg)', color: 'var(--color-muted)' }}>
        Cargando sesión…
      </div>
    );
  }

  return (
    <div className={isAuthenticated ? 'app-shell' : ''}>
      {isAuthenticated && (
        <Navbar
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={setSidebarOpen}
        />
      )}
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
      <div className={isAuthenticated ? 'app-content' : ''}>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <div className="welcome-screen">
                <div className="welcome-icon">👋</div>
                <h2>Hola, <strong>{usuarioAuth.nombre || 'Usuario'}</strong></h2>
                <p>Bienvenido al sistema POS. Usa el menú lateral para navegar.</p>
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
        <Route path="/reportes" element={isAuthenticated ? <Reportes /> : <Navigate to="/login" />} />
        {/* ✅ Nuevas rutas de entradas y salidas protegidas */}
        <Route path="/entradas" element={isAuthenticated ? <Entradas /> : <Navigate to="/login" />} />
        <Route path="/salidas" element={isAuthenticated ? <Salidas /> : <Navigate to="/login" />} />

        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/historial-ventas" element={isAuthenticated ? <HistorialVentas /> : <Navigate to="/login" />} />
        <Route path="/logs" element={isAuthenticated ? <HistorialLogs /> : <Navigate to="/login" />} />
        <Route path="/categorias" element={isAuthenticated ? <Categorias /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
      </Routes>
      </div>
    </div>
  );
}

export default AppWrapper;