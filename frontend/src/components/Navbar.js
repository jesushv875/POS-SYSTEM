import React from 'react';
import { Link } from 'react-router-dom'; // Para navegación con React Router
import '../css/Navbar.css'; // Asegúrate de que tienes este archivo CSS
import { FaTachometerAlt, FaCashRegister, FaWarehouse, FaFileAlt, FaCog, FaSignOutAlt, FaPeopleArrows } from 'react-icons/fa';

function Navbar() {
  const handleLogout = () => {
    localStorage.removeItem('token'); // Elimina el token JWT del localStorage
    window.location.href = '/'; // Redirige a la página de login
  };

  return (
    <nav className="navbar">
      <ul className="navbar-menu">
        <li>
          <Link to="/caja" className="navbar-link">
            <FaTachometerAlt /> Caja
          </Link>
        </li>
        <li>
          <Link to="/ventas" className="navbar-link">
            <FaCashRegister /> Ventas
          </Link>
        </li>
        <li>
          <Link to="/inventario" className="navbar-link">
            <FaWarehouse /> Inventario
          </Link>
        </li>
        <li>
          <Link to="/reportes" className="navbar-link">
            <FaFileAlt /> Reportes
          </Link>
        </li>
        <li>
          <Link to="/Agregar-Proveedor" className="navbar-link">
            <FaPeopleArrows /> Proveedor
          </Link>
        </li>
        <li>
          <Link to="/configuracion" className="navbar-link">
            <FaCog /> Configuración
          </Link>
        </li>
        <li>
          <button onClick={handleLogout} className="navbar-link">
            <FaSignOutAlt /> Cerrar sesión
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;