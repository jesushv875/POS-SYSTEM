// src/pages/Dashboard.js
import useAutoLogout from './useAutoLogout';
import AutoLogoutModal from './components/AutoLogoutModal';
import React from 'react';

function Dashboard() {
  const { showWarning, setShowWarning, resetTimers } = useAutoLogout();

  const handleStay = () => {
    setShowWarning(false);
    resetTimers();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div>
      <h1>Bienvenido al sistema</h1>
      {/* tu contenido */}

      {showWarning && <AutoLogoutModal onStay={handleStay} onLogout={handleLogout} />}
    </div>
  );
}

export default Dashboard;