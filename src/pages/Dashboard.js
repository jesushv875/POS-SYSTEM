import React, { useEffect, useState } from 'react';
import { FaCashRegister, FaShoppingCart, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dashboard`, { headers: authHeader() });
        if (!res.ok) throw new Error('Error al cargar métricas');
        setData(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <p style={{ padding: '20px' }}>Cargando dashboard…</p>;
  if (error) return <p style={{ padding: '20px', color: 'var(--color-danger)' }}>{error}</p>;

  const { caja, ventasHoy, totalVentasHoy, productosBajoStock, ultimasVentas } = data;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Resumen del día — {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon green"><FaCashRegister /></div>
          <div className="stat-label">Estado de caja</div>
          <div className="stat-value" style={{ fontSize: '1.1rem' }}>
            {caja ? <span style={{ color: 'var(--color-success)' }}>Abierta</span> : <span style={{ color: 'var(--color-danger)' }}>Cerrada</span>}
          </div>
          {caja && <div style={{ fontSize: '.8rem', color: 'var(--color-muted)', marginTop: '4px' }}>${parseFloat(caja.totalEnCaja).toFixed(2)} en caja</div>}
        </div>

        <div className="stat-card">
          <div className="stat-icon blue"><FaChartLine /></div>
          <div className="stat-label">Ventas del día</div>
          <div className="stat-value">${totalVentasHoy.toFixed(2)}</div>
          <div style={{ fontSize: '.8rem', color: 'var(--color-muted)', marginTop: '4px' }}>{ventasHoy} transacciones</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FaShoppingCart /></div>
          <div className="stat-label">Transacciones hoy</div>
          <div className="stat-value">{ventasHoy}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: productosBajoStock > 0 ? '#fee2e2' : '#f0fdf4', color: productosBajoStock > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            <FaExclamationTriangle />
          </div>
          <div className="stat-label">Productos bajo stock</div>
          <div className="stat-value" style={{ color: productosBajoStock > 0 ? 'var(--color-danger)' : 'inherit' }}>
            {productosBajoStock}
          </div>
          {productosBajoStock > 0 && <div style={{ fontSize: '.8rem', color: 'var(--color-danger)', marginTop: '4px' }}>Requieren reposición</div>}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Últimas ventas</h2>
        {ultimasVentas.length === 0 ? (
          <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '20px' }}>No hay ventas registradas hoy.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Cajero</th>
                <th>Método de pago</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {ultimasVentas.map(v => (
                <tr key={v.id}>
                  <td style={{ color: 'var(--color-muted)', fontSize: '.85rem' }}>#{v.id}</td>
                  <td>{new Date(v.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{v.usuario?.nombre || '—'}</td>
                  <td>
                    <span className={`badge ${v.metodoPago === 'efectivo' ? 'badge-success' : 'badge-info'}`}>
                      {v.metodoPago || 'efectivo'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>${parseFloat(v.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
