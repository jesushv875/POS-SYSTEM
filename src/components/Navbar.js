import React from 'react';
import { NavLink } from 'react-router-dom';
import '../css/Navbar.css';
import {
  FaCashRegister, FaWarehouse, FaFileAlt, FaCog,
  FaSignOutAlt, FaTruck, FaArrowDown, FaArrowUp,
  FaUsers, FaStore, FaChartLine, FaHistory, FaBars, FaTimes, FaTags, FaClipboardList,
} from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

function Navbar({ onLogout, isOpen, onToggle }) {
  let nombre = '', rol = '';
  try {
    const token = localStorage.getItem('token');
    if (token) { const d = jwtDecode(token); nombre = d.nombre || ''; rol = d.rol || ''; }
  } catch (_) {}

  const isAdmin   = rol === 'admin';
  const isGerente = rol === 'gerente' || isAdmin;
  const initials  = nombre ? nombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';

  const link = (to, icon, label) => (
    <NavLink
      to={to}
      className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
      onClick={() => onToggle && onToggle(false)}
    >
      <span className="sidebar-link-icon">{icon}</span>{label}
    </NavLink>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="topbar">
        <button className="hamburger" onClick={() => onToggle && onToggle(!isOpen)} aria-label="Menú">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        <div className="topbar-brand">
          <div className="topbar-brand-icon"><FaStore /></div>
          <span className="topbar-brand-name">POS System</span>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`sidebar-overlay${isOpen ? ' open' : ''}`}
        onClick={() => onToggle && onToggle(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><FaStore /></div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">POS System</span>
            <span className="sidebar-brand-sub">Panel de control</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Operaciones</div>
          {isGerente && link('/dashboard',       <FaChartLine />,   'Dashboard')}
          {link('/caja',                         <FaCashRegister />, 'Caja')}
          {link('/ventas',                       <FaStore />,        'Ventas')}
          {isGerente && link('/historial-ventas',<FaHistory />,      'Historial ventas')}

          <div className="sidebar-section-label">Inventario</div>
          {link('/inventario', <FaWarehouse />, 'Productos')}
          {isGerente && link('/entradas', <FaArrowDown />, 'Entradas')}
          {isGerente && link('/salidas',  <FaArrowUp />,   'Salidas')}

          <div className="sidebar-section-label">Administración</div>
          {isGerente && link('/reportes',          <FaFileAlt />,      'Reportes')}
          {isGerente && link('/agregar-proveedor', <FaTruck />,        'Proveedores')}
          {isGerente && link('/categorias',        <FaTags />,         'Categorías')}
          {isAdmin   && link('/usuarios',          <FaUsers />,        'Usuarios')}
          {isAdmin   && link('/logs',              <FaClipboardList />, 'Logs')}
          {isAdmin   && link('/configuracion',     <FaCog />,          'Configuración')}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{nombre || 'Usuario'}</span>
              <span className="sidebar-user-role">{rol}</span>
            </div>
          </div>
          <button className="sidebar-link" onClick={onLogout} style={{ marginTop: '4px' }}>
            <span className="sidebar-link-icon"><FaSignOutAlt /></span>Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

export default Navbar;
