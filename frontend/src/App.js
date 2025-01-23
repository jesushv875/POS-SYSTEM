// src/App.js
import './css/App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AgregarProductos from './agregarProductos';
import Inventario from './Inventario';
import Home from './Home'; // Vista principal (Agregar productos)
import Navbar from './components/Navbar'; // Importa el Navbar
import Login from './components/Login'; // Importa el componente Login

function App() {
  // Estado para verificar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Comprobar si el usuario tiene un token en el localStorage al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true); // Si existe un token, consideramos que el usuario está autenticado
    }
  }, []);

  // Función que se llama cuando el login es exitoso
  const handleLogin = () => {
    setIsAuthenticated(true); // Cambia el estado para mostrar el Navbar
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
        <Route path="/agregarProductos" element={isAuthenticated ? <AgregarProductos /> : <Login onLogin={handleLogin} />} />
        <Route path="/inventario" element={isAuthenticated ? <Inventario /> : <Login onLogin={handleLogin} />} />
      </Routes>
    </Router>
  );
}

export default App;