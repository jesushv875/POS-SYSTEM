import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useAutoLogout = (timeout = 5 * 60 * 1000, warningTime = 60 * 1000) => {
  const navigate = useNavigate();
  const logoutTimeout = useRef(null);
  const warningTimeout = useRef(null);
  const [showWarning, setShowWarning] = useState(false);

  const logout = () => {
    localStorage.removeItem('token'); // o lo que uses
    alert('Sesión cerrada por inactividad');
    navigate('/');
  };

  const resetTimers = () => {
    // Cancelar si hay temporizadores activos
    if (logoutTimeout.current) clearTimeout(logoutTimeout.current);
    if (warningTimeout.current) clearTimeout(warningTimeout.current);

    setShowWarning(false); // Ocultar modal si estaba mostrándose

    // Iniciar nuevo warning
    warningTimeout.current = setTimeout(() => {
      setShowWarning(true);
    }, timeout - warningTime);

    // Iniciar nuevo logout
    logoutTimeout.current = setTimeout(() => {
      logout();
    }, timeout);
  };

  useEffect(() => {
    const eventos = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    eventos.forEach((e) => window.addEventListener(e, resetTimers));

    resetTimers(); // Iniciar temporizador al montar

    return () => {
      eventos.forEach((e) => window.removeEventListener(e, resetTimers));
      clearTimeout(logoutTimeout.current);
      clearTimeout(warningTimeout.current);
    };
  }, []);

  return { showWarning, setShowWarning, resetTimers };
};

export default useAutoLogout;