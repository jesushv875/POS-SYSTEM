// src/pages/Home.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Login from './components/Login';

function Home() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true); // Cambiar el estado a logueado
  };

  return (
    <div>
      {loggedIn ? (
        <div>
          <h1>Bienvenido</h1>
          <Link to="/inventario">Ir al Inventario</Link>
          <Link to="/agregarProductos">Agregar Productos</Link>
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default Home;