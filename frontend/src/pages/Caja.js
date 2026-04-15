import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { FaCashRegister, FaPrint, FaArrowUp, FaArrowDown, FaLock, FaList } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

function Caja() {
  const [caja, setCaja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [corte, setCorte] = useState(null);
  const [nuevoFondo, setNuevoFondo] = useState('');
  const [montoMovimiento, setMontoMovimiento] = useState('');
  const [motivoMovimiento, setMotivoMovimiento] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState('ingreso');
  const [usuarioRol, setUsuarioRol] = useState('');
  const [movimientos, setMovimientos] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirmCierre, setConfirmCierre] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const isGerente = usuarioRol === 'gerente' || usuarioRol === 'admin';

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) { const d = jwtDecode(token); setUsuarioRol(d.rol || ''); }
    } catch (_) {}
    fetchCaja();
    fetchMovimientos();
  }, []);

  const fetchCaja = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/caja/hoy`, { headers: authHeader() });
      setCaja(res.ok ? await res.json() : null);
    } catch (_) { setCaja(null); }
    finally { setLoading(false); }
  };

  const fetchMovimientos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/caja/movimientos`, { headers: authHeader() });
      if (res.ok) setMovimientos(await res.json());
    } catch (_) {}
  };

  const iniciarCaja = async () => {
    const fondo = parseFloat(nuevoFondo);
    if (isNaN(fondo) || fondo <= 0) { showToast('Ingresa un fondo válido', 'danger'); return; }
    try {
      const res = await fetch(`${API_URL}/api/caja/iniciar`, {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({ fondoInicial: fondo }),
      });
      if (res.ok) {
        showToast('Caja iniciada correctamente');
        setNuevoFondo('');
        fetchCaja();
      } else {
        const err = await res.json();
        showToast(err.error || 'Error al iniciar caja', 'danger');
      }
    } catch (_) { showToast('Error de conexión', 'danger'); }
  };

  const cerrarCaja = async () => {
    setConfirmCierre(false);
    try {
      const res = await fetch(`${API_URL}/api/caja/cerrar`, { method: 'PUT', headers: authHeader() });
      if (res.ok) {
        showToast('Caja cerrada correctamente');
        setCorte(null);
        fetchCaja();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error al cerrar caja', 'danger');
      }
    } catch (_) { showToast('Error de conexión', 'danger'); }
  };

  const registrarMovimiento = async () => {
    const monto = parseFloat(montoMovimiento);
    if (isNaN(monto) || monto <= 0) { showToast('Monto inválido', 'danger'); return; }
    if (!motivoMovimiento.trim()) { showToast('Ingresa el motivo', 'danger'); return; }

    const endpoint = tipoMovimiento === 'ingreso' ? '/api/caja/ingreso' : '/api/caja/egreso';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({ monto, motivo: motivoMovimiento }),
      });
      if (res.ok) {
        setMontoMovimiento(''); setMotivoMovimiento('');
        showToast(`${tipoMovimiento === 'ingreso' ? 'Ingreso' : 'Egreso'} registrado`);
        fetchCaja();
        fetchMovimientos();
      } else {
        const err = await res.json();
        showToast(err.error || 'Error al registrar movimiento', 'danger');
      }
    } catch (_) { showToast('Error de conexión', 'danger'); }
  };

  const obtenerCorte = async () => {
    try {
      const res = await fetch(`${API_URL}/api/caja/corte`, { headers: authHeader() });
      if (res.ok) setCorte(await res.json());
      else showToast('Error al obtener corte', 'danger');
    } catch (_) { showToast('Error de conexión', 'danger'); }
  };

  const imprimirCorte = () => {
    const el = document.getElementById('corte-caja');
    if (!el) return;
    const win = window.open('', '', 'width=320,height=600');
    win.document.write(`<html><head><style>body{font-family:monospace;font-size:12px;padding:10px;} hr{border-top:1px dashed #000;}</style></head><body>${el.innerHTML}</body></html>`);
    win.document.close(); win.print(); win.close();
  };

  if (loading) return <p style={{ padding: '20px' }}>Cargando caja…</p>;

  // Sin caja abierta
  if (!caja) {
    return (
      <div>
        <div className="page-header"><h1>Caja</h1></div>
        <div className="card" style={{ maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--color-primary-light)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.5rem', color: 'var(--color-primary)' }}>
              <FaCashRegister />
            </div>
            <h2>No hay caja abierta</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '.875rem', marginTop: '4px' }}>
              {isGerente ? 'Ingresa el fondo inicial para comenzar el día.' : 'Espera a que un gerente abra la caja.'}
            </p>
          </div>

          {isGerente ? (
            <>
              <div className="form-group">
                <label>Fondo inicial</label>
                <input type="number" min="0" step="0.01" placeholder="$0.00"
                  value={nuevoFondo} onChange={e => setNuevoFondo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && iniciarCaja()} />
              </div>
              <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }} onClick={iniciarCaja}>
                <FaCashRegister /> Iniciar caja
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '.875rem' }}>
              <FaLock style={{ fontSize: '1.2rem', marginBottom: '4px' }} /><br />
              Solo gerentes y administradores pueden abrir la caja.
            </div>
          )}
        </div>

        {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      </div>
    );
  }

  // Caja abierta
  return (
    <div>
      <div className="page-header">
        <h1>Caja del día</h1>
        <p>Abierta el {new Date(caja.fecha).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon green"><FaCashRegister /></div>
          <div className="stat-label">Total en caja</div>
          <div className="stat-value">${parseFloat(caja.totalEnCaja).toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><FaArrowUp /></div>
          <div className="stat-label">Fondo inicial</div>
          <div className="stat-value">${parseFloat(caja.fondoInicial || 0).toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple" style={{ background: '#f5f3ff', color: '#8b5cf6' }}><FaArrowDown /></div>
          <div className="stat-label">Total ventas</div>
          <div className="stat-value">${parseFloat(caja.totalVentas || 0).toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isGerente ? '1fr 1fr' : '1fr', gap: '20px' }}>

        {/* Movimientos de caja */}
        {isGerente && (
          <div className="card">
            <h2 className="card-title">Movimientos de caja</h2>
            <div className="form-group">
              <label>Tipo</label>
              <select value={tipoMovimiento} onChange={e => setTipoMovimiento(e.target.value)}>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso / Retiro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Monto</label>
              <input type="number" min="0" step="0.01" placeholder="$0.00"
                value={montoMovimiento} onChange={e => setMontoMovimiento(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Motivo</label>
              <input type="text" placeholder="Ej. Pago a proveedor"
                value={motivoMovimiento} onChange={e => setMotivoMovimiento(e.target.value)} />
            </div>
            <button
              className={`btn ${tipoMovimiento === 'ingreso' ? 'btn-success' : 'btn-danger'}`}
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={registrarMovimiento}
            >
              {tipoMovimiento === 'ingreso' ? <><FaArrowDown /> Registrar ingreso</> : <><FaArrowUp /> Registrar egreso</>}
            </button>
          </div>
        )}

        {/* Corte y cierre */}
        <div className="card">
          <h2 className="card-title">Corte y cierre</h2>
          {isGerente && (
            <>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '10px' }} onClick={obtenerCorte}>
                Generar corte de caja
              </button>
              <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setConfirmCierre(true)}>
                Cerrar caja
              </button>
            </>
          )}
          {!isGerente && (
            <p style={{ color: 'var(--color-muted)', fontSize: '.875rem' }}>
              Solo gerentes y administradores pueden cerrar la caja.
            </p>
          )}

          {corte && (
            <div style={{ marginTop: '16px' }}>
              <div id="corte-caja" style={{ fontFamily: 'monospace', fontSize: '12px', background: '#f8fafc', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', lineHeight: '1.8' }}>
                <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: '8px' }}>── CORTE DE CAJA ──</div>
                <div>Fecha: {corte.fecha ? new Date(corte.fecha).toLocaleString('es-MX') : '—'}</div>
                <hr style={{ border: 'none', borderTop: '1px dashed #ccc' }} />
                <div>Fondo inicial:  ${Number(corte.fondoInicial ?? 0).toFixed(2)}</div>
                <div>Total ventas:   ${Number(corte.totalVentas  ?? 0).toFixed(2)}</div>
                <div>  Efectivo:     ${Number(corte.efectivo     ?? 0).toFixed(2)}</div>
                <div>  Tarjeta:      ${Number(corte.tarjeta      ?? 0).toFixed(2)}</div>
                <div>Ingresos:       ${Number(corte.ingresos     ?? 0).toFixed(2)}</div>
                <div>Egresos:        ${Number(corte.egresos      ?? 0).toFixed(2)}</div>
                <hr style={{ border: 'none', borderTop: '1px dashed #ccc' }} />
                <div style={{ fontWeight: 700 }}>Total en caja:  ${Number(corte.totalEnCaja ?? 0).toFixed(2)}</div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }} onClick={imprimirCorte}>
                <FaPrint /> Imprimir corte
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Historial de movimientos */}
      {isGerente && (
        <div className="card" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}><FaList style={{ marginRight: '8px' }} />Movimientos del día</h2>
          </div>
          {movimientos.length === 0 ? (
            <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '20px' }}>Sin movimientos registrados.</p>
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Motivo</th>
                    <th style={{ textAlign: 'right' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontSize: '.85rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(m.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td>
                        <span className={`badge ${m.tipo === 'ingreso' ? 'badge-success' : m.tipo === 'venta' ? 'badge-info' : 'badge-danger'}`}>
                          {m.tipo}
                        </span>
                      </td>
                      <td>{m.motivo || '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: (m.tipo === 'retiro' || m.tipo === 'egreso') ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {(m.tipo === 'retiro' || m.tipo === 'egreso') ? '-' : '+'}${parseFloat(m.monto).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirm cierre modal */}
      {confirmCierre && (
        <div className="modal-overlay" onClick={() => setConfirmCierre(false)}>
          <div className="modal" style={{ maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">¿Cerrar la caja?</h2>
            </div>
            <p style={{ color: 'var(--color-muted)', fontSize: '.9rem', marginBottom: '20px' }}>
              Se registrará el cierre de la caja del día. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setConfirmCierre(false)}>
                Cancelar
              </button>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={cerrarCaja}>
                Sí, cerrar caja
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default Caja;
