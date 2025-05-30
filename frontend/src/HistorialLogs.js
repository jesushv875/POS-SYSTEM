import React, { useEffect, useState } from 'react';
import './css/HistorialLogs.css'; // Asegúrate de importar los estilos

const API_URL = process.env.REACT_APP_API_URL;

function HistorialLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${API_URL}/api/logs`);
        if (!response.ok) {
          throw new Error('Error al obtener los logs');
        }
        const data = await response.json();
        setLogs(data);
        setFilteredLogs(data); // Inicialmente, mostrar todos los logs
      } catch (error) {
        console.error('Error en fetchLogs:', error);
        setError(error.message);
      }
    };

    fetchLogs();
  }, []);

  const handleFilter = () => {
    if (!fechaInicio || !fechaFin) {
      alert('Selecciona ambas fechas');
      return;
    }

    const inicio = new Date(fechaInicio).setHours(0, 0, 0, 0);
    const fin = new Date(fechaFin).setHours(23, 59, 59, 999);

    const logsFiltrados = logs.filter((log) => {
      const fechaLog = new Date(log.fecha).getTime();
      return fechaLog >= inicio && fechaLog <= fin;
    });

    setFilteredLogs(logsFiltrados);
  };

  return (
    <div className="logs-container">
      <h2>Historial de Logs</h2>

      <div className="filter-container">
        <label>Desde:</label>
        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        <label>Hasta:</label>
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        <button onClick={handleFilter}>Filtrar</button>
      </div>

      {error ? (
        <p className="error-message">Error al cargar los logs: {error}</p>
      ) : (
        <table className="logs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Acción</th>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.accion}</td>
                  <td>{new Date(log.fecha).toLocaleString()}</td>
                  <td>{log.usuario?.nombre || 'Desconocido'}</td>
                  <td>{log.detalles}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-logs">No hay logs en este rango de fechas</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default HistorialLogs;