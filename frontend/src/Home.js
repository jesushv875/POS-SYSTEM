import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Inicio</h1>
      
      {/* Enlace a la vista de inventario */}
      <Link to="/inventario" style={{ marginTop: '20px', display: 'inline-block' }}>
        Ir al Inventario
      </Link>
      <Link to="/agregarProductos" style={{ marginTop: '20px', display: 'inline-block' }}>
        Agregar Productos
      </Link>
    </div>
  );
}

export default Home;