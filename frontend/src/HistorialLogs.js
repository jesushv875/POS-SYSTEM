import React, { useEffect, useState } from 'react';
import { FaHistory, FaSearch, FaTimes, FaFilter } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const ACCION_BADGE = {
  LOGIN:    'badge-success',
  LOGOUT:   'badge-warning',
  CREATE:   'badge-info',
  UPDATE:   'badge-warning',
  DELETE:   'badge-danger',
};

function HistorialLogs() {
  const [logs, setLogs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [busqueda, setBusqueda]     = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin]       = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/logs`, { headers: authHeader() });
        if (!res.ok) throw new Error('Error al obtener los logs');
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error en fetchLogs:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const limpiarFiltros = () => { setBusqueda(''); setFechaInicio(''); setFechaFin(''); };

  const logsFiltrados = logs.filter(log => {
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const match =
        (log.accion     || '').toLowerCase().includes(q) ||
        (log.detalles   || '').toLowerCase().includes(q) ||
        (log.usuario?.nombre || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (fechaInicio) {
      const inicio = new Date(fechaInicio); inicio.setHours(0, 0, 0, 0);
      if (new Date(log.fecha) < inicio) return false;
    }
    if (fechaFin) {
      const fin = new Date(fechaFin); fin.setHours(23, 59, 59, 999);
      if (new Date(log.fecha) > fin) return false;
    }
    return true;
  });

  const hayFiltros = busqueda || fechaInicio || fechaFin;

  if (loading) return <p style={{ padding: '20px' }}>Cargando logs…</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Historial de logs</h1>
        <p>{logsFiltrados.length} de {logs.length} registros</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="search-wrapper" style={{ flex: 1, minWidth: '200px' }}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por acción, usuario o detalles…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '140px' }}>
            <label style={{ fontSize: '.72rem' }}>Desde</label>
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '140px' }}>
            <label style={{ fontSize: '.72rem' }}>Hasta</label>
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          </div>
          {hayFiltros && (
            <button className="btn btn-ghost btn-sm" onClick={limpiarFiltros} title="Limpiar filtros">
              <FaTimes /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {error ? (
          <div className="empty-state">
            <p style={{ color: 'var(--color-danger)' }}>Error al cargar los logs: {error}</p>
          </div>
        ) : logsFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FaFilter /></div>
            <p>{hayFiltros ? 'Sin registros para los filtros aplicados.' : 'No hay logs registrados.'}</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {logsFiltrados.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--color-muted)', fontSize: '.82rem' }}>{log.id}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '.82rem', color: 'var(--color-muted)' }}>
                      {new Date(log.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td style={{ fontWeight: 500 }}>{log.usuario?.nombre || 'Sistema'}</td>
                    <td>
                      <span className={`badge ${ACCION_BADGE[log.accion?.toUpperCase()] || 'badge-gray'}`}>
                        {log.accion}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-muted)', fontSize: '.85rem', maxWidth: '320px' }}>
                      {log.detalles || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistorialLogs;
