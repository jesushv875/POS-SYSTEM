import React, { useEffect, useState } from 'react';
import '../css/AutoLogoutModal.css';

function AutoLogoutModal({ nombre, correo, onStay, onLogout }) {
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutos
  const [visible, setVisible] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!visible) return;

    if (secondsLeft === 0) {
      onLogout();         // Cierra sesión
      setVisible(false);  // Cierra el modal
      setShowToast(true); // Muestra notificación
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, visible, onLogout]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleStay = () => {
    onStay();           // Mantiene sesión
    setVisible(false);  // Cierra modal
  };

  return (
    <>
      {visible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h2>¿Sigues aquí?</h2>
            <p><strong>{nombre}</strong> {correo}</p>
            <p>Tu sesión se cerrará automáticamente en:</p>
            <h3>{formatTime(secondsLeft)}</h3>
            <button onClick={handleStay} style={{ marginTop: '15px', padding: '10px 20px' }}>
              Seguir aquí
            </button>
          </div>
        </div>
      )}

      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#ff4d4f',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          zIndex: 9999
        }}>
          Sesión cerrada por inactividad.
        </div>
      )}
    </>
  );
}

export default AutoLogoutModal;