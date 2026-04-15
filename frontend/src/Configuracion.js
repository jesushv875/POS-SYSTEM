import React, { useState, useEffect } from 'react';
import HistorialLogs from './HistorialLogs';
import Categorias from './pages/Categorias';
import Usuarios from './pages/Usuarios';
import { FaStore, FaTags, FaUsers, FaClipboardList, FaSave, FaCheck } from 'react-icons/fa';

const TABS = [
  { id: 'tienda',     label: 'Datos de la tienda',  icon: <FaStore /> },
  { id: 'categorias', label: 'Categorías',           icon: <FaTags /> },
  { id: 'usuarios',   label: 'Usuarios',             icon: <FaUsers /> },
  { id: 'logs',       label: 'Historial de logs',    icon: <FaClipboardList /> },
];

const DEFAULT = { nombre: '', direccion: '', ciudad: '', telefono: '', rfc: '' };

function Configuracion() {
  const [tab, setTab]       = useState('tienda');
  const [tienda, setTienda] = useState(DEFAULT);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('tienda_config');
    if (stored) setTienda(JSON.parse(stored));
  }, []);

  const handleChange = (e) => {
    setTienda(t => ({ ...t, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const guardar = (e) => {
    e.preventDefault();
    localStorage.setItem('tienda_config', JSON.stringify(tienda));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Configuración</h1>
        <p>Ajustes del sistema POS</p>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '2px solid var(--color-border)', marginBottom: '24px', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: tab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
            marginBottom: '-2px',
            color: tab === t.id ? 'var(--color-primary)' : 'var(--color-muted)',
            fontWeight: tab === t.id ? 700 : 500,
            cursor: 'pointer', fontSize: '.875rem', whiteSpace: 'nowrap',
            transition: 'color .15s', fontFamily: 'var(--font)',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Store config */}
      {tab === 'tienda' && (
        <div className="card" style={{ maxWidth: '540px' }}>
          <h2 className="card-title"><FaStore /> Datos de la tienda</h2>
          <p style={{ fontSize: '.85rem', color: 'var(--color-muted)', marginBottom: '20px', marginTop: '-8px' }}>
            Esta información aparece en los tickets de venta impresos.
          </p>
          <form onSubmit={guardar}>
            <div className="form-grid">
              <div className="form-group span-2">
                <label>Nombre de la tienda / farmacia</label>
                <input name="nombre" value={tienda.nombre} onChange={handleChange} placeholder="Ej. Farmacia Salud+" />
              </div>
              <div className="form-group span-2">
                <label>Dirección</label>
                <input name="direccion" value={tienda.direccion} onChange={handleChange} placeholder="Ej. Av. 5 de Mayo #123, Col. Centro" />
              </div>
              <div className="form-group">
                <label>Ciudad / Estado</label>
                <input name="ciudad" value={tienda.ciudad} onChange={handleChange} placeholder="Ej. Monterrey, N.L." />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input name="telefono" value={tienda.telefono} onChange={handleChange} placeholder="Ej. 81 1234 5678" />
              </div>
              <div className="form-group">
                <label>RFC</label>
                <input name="rfc" value={tienda.rfc} onChange={handleChange} placeholder="Ej. FAR230101ABC" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '6px' }}>
              {saved ? <><FaCheck /> Guardado</> : <><FaSave /> Guardar cambios</>}
            </button>
          </form>
        </div>
      )}

      {tab === 'categorias' && <Categorias />}
      {tab === 'usuarios'   && <Usuarios />}
      {tab === 'logs'       && <HistorialLogs />}
    </div>
  );
}

export default Configuracion;
