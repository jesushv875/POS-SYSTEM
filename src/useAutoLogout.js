import { useEffect, useRef, useState, useCallback } from 'react';

const useAutoLogout = (timeout = 300000, warningTime = 60000, onLogout) => {
  const logoutTimeout = useRef(null);
  const warningTimeout = useRef(null);
  const [showWarning, setShowWarning] = useState(false);

  const logout = useCallback(() => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
  }, [onLogout]);

  const resetTimers = useCallback(() => {
    if (showWarning) return; // 👈 NO reiniciar si el modal está activo

    clearTimeout(logoutTimeout.current);
    clearTimeout(warningTimeout.current);
    setShowWarning(false);

    warningTimeout.current = setTimeout(() => {
      setShowWarning(true);
    }, timeout - warningTime);

    logoutTimeout.current = setTimeout(() => {
      logout();
    }, timeout);
  }, [logout, timeout, warningTime, showWarning]);

  useEffect(() => {
    if (!onLogout) return;

    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimers));

    resetTimers();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimers));
      clearTimeout(logoutTimeout.current);
      clearTimeout(warningTimeout.current);
    };
  }, [resetTimers, onLogout]);

  return { showWarning, setShowWarning, resetTimers };
};

export default useAutoLogout;