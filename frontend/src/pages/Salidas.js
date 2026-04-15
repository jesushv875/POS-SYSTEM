import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaBoxOpen, FaFilePdf, FaImage } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });

const EMPTY = { productoId: '', motivo: '', cantidad: '', comentario: '', imagen: null };

function Salidas() {
  const [productos, setProductos] = useState([]);
  const [salidas, setSalidas]     = useState([]);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/productos`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(d => setProductos(Array.isArray(d) ? d : []));
    fetchSalidas();
  }, []);

  const fetchSalidas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/inventario/salidas`, { headers: authHeader() });
      if (res.ok) setSalidas(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    data.append('productoId', form.productoId);
    data.append('motivo',     form.motivo);
    data.append('cantidad',   form.cantidad);
    data.append('comentario', form.comentario);
    if (form.imagen) data.append('imagen', form.imagen);
    try {
      const res = await fetch(`${API_URL}/api/inventario/salida`, {
        method: 'POST', headers: authHeader(), body: data,
      });
      const result = await res.json();
      if (res.ok) {
        showToast('Salida registrada correctamente');
        setForm(EMPTY);
        fetchSalidas();
      } else {
        showToast(result.message || 'Error al registrar', 'danger');
      }
    } catch (e) {
      showToast('Error de conexión', 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Salidas de inventario</h1>
        <p>Registra mermas, vencimientos, ajustes de stock a la baja u otras salidas</p>
      </div>

      <div className="entradas-layout">
        {/* Form */}
        <div className="card">
          <h2 className="card-title"><FaArrowUp style={{ color: 'var(--color-danger)' }} /> Nueva salida</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Producto *</label>
              <select name="productoId" value={form.productoId} onChange={handleChange} required>
                <option value="">Selecciona un producto</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Motivo *</label>
              <input name="motivo" type="text" value={form.motivo} onChange={handleChange} required
                placeholder="Ej. Merma, Vencimiento, Robo…" />
            </div>
            <div className="form-group">
              <label>Cantidad *</label>
              <input name="cantidad" type="number" min="1" value={form.cantidad} onChange={handleChange} required placeholder="0" />
            </div>
            <div className="form-group">
              <label>Comentario</label>
              <input name="comentario" type="text" value={form.comentario} onChange={handleChange} placeholder="Opcional" />
            </div>
            <div className="form-group">
              <label>Documento (imagen o PDF)</label>
              <input name="imagen" type="file" onChange={handleChange} accept="image/*,.pdf" />
            </div>
            <button type="submit" className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
              {saving ? 'Registrando…' : <><FaArrowUp /> Registrar salida</>}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>Historial de salidas</h2>
          </div>
          {salidas.length === 0
            ? <div className="empty-state"><div className="empty-state-icon"><FaBoxOpen /></div><p>Sin salidas registradas.</p></div>
            : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Producto</th>
                      <th>Motivo</th>
                      <th style={{ textAlign: 'center' }}>Cant.</th>
                      <th>Comentario</th>
                      <th>Archivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salidas.map(s => {
                      const nombre = productos.find(p => p.id === s.productoId)?.nombre || `#${s.productoId}`;
                      return (
                        <tr key={s.id}>
                          <td style={{ fontSize: '.8rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                            {new Date(s.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td style={{ fontWeight: 500 }}>{nombre}</td>
                          <td>{s.motivo}</td>
                          <td style={{ textAlign: 'center' }}><span className="badge badge-danger">{s.cantidad}</span></td>
                          <td style={{ color: 'var(--color-muted)', fontSize: '.85rem' }}>{s.comentario || '—'}</td>
                          <td>
                            {s.imagenUrl
                              ? s.imagenUrl.toLowerCase().endsWith('.pdf')
                                ? <a href={`${API_URL}${s.imagenUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><FaFilePdf /> PDF</a>
                                : <a href={`${API_URL}${s.imagenUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><FaImage /> Ver</a>
                              : <span style={{ color: 'var(--color-muted)', fontSize: '.8rem' }}>—</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default Salidas;
