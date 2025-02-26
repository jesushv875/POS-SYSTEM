import './css/App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inventario from './Inventario';
import Home from './Home'; // Vista principal (Agregar productos)
import Navbar from './components/Navbar'; // Importa el Navbar
import Login from './components/Login'; // Importa el componente Login
import AgregarProveedor from './AgregarProveedor'; 
import Usuarios from './pages/Usuarios';
import Configuracion from './Configuracion';
import { jwtDecode } from 'jwt-decode';
import Ventas from './pages/Ventas';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null); // Estado para almacenar el usuarioId
  const token = localStorage.getItem('token');


  // Función para decodificar el token y obtener el usuarioId
  const getUserIdFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.userId;  // Suponiendo que el 'userId' está en el payload
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  };

  // Comprobar si el usuario tiene un token en el localStorage al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true); // Si existe un token, consideramos que el usuario está autenticado
      const userId = getUserIdFromToken(token); // Obtener el usuarioId desde el token
      setUsuarioId(userId);  // Guardar el usuarioId en el estado
    }
  }, []);

  // Función que se llama cuando el login es exitoso
  const handleLogin = () => {
    setIsAuthenticated(true); // Cambia el estado para mostrar el Navbar
    const token = localStorage.getItem('token');
    if (token) {
      const userId = getUserIdFromToken(token);
      setUsuarioId(userId);
      //console.log('Token al hacer login:', token);  // Imprimir el token cuando se haya logueado
    }
  };

  return (
    <Router>
      {isAuthenticated && <Navbar />} {/* Solo mostrar el Navbar si está autenticado */}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <div>
                <h1>Bienvenido al sistema de punto de venta</h1>
                {/* Aquí puedes agregar más detalles del usuario si lo deseas */}
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
      </Routes>
    </Router>
  );
}

export default App;