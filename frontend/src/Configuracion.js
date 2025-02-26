import React, { useState } from 'react';
import HistorialLogs from './HistorialLogs';
import Categorias from './pages/Categorias';
import Usuarios from './pages/Usuarios'; // Si ya tienes gestión de usuarios

function Configuracion() {
  const [vista, setVista] = useState('usuarios'); // 'usuarios' o 'logs'

  return (
    <div className="container">
      <h1>Configuración</h1>
      <div className="config-menu">
        <button onClick={() => setVista('usuarios')}>Gestión de Usuarios</button>
        <button onClick={() => setVista('categorias')}>Gestión de Categorías</button>
        <button onClick={() => setVista('logs')}>Historial y Logs</button>
      </div>
      <div className="config-content">
        {vista === 'usuarios' && <Usuarios />}
        {vista === 'categorias' && <Categorias />}
        {vista === 'logs' && <HistorialLogs />}
      </div>
    </div>
  );
}

export default Configuracion;