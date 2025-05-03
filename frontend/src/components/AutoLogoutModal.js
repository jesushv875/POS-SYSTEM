import React from 'react';

const AutoLogoutModal = ({ onStay, onLogout }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>¿Sigues ahí?</h2>
        <p>Tu sesión se cerrará por inactividad en menos de un minuto.</p>
        <div>
          <button onClick={onStay}>Seguir aquí</button>
          <button onClick={onLogout}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
};

export default AutoLogoutModal;