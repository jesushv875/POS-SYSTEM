import React, { useState, useEffect } from 'react';
import { FaArrowDown, FaBoxOpen, FaFilePdf, FaImage } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });

const EMPTY = { productoId: '', motivo: '', cantidad: '', comentario: '', imagen: null };

function Entradas() {
  const [productos, setProductos] = useState([]);
  const [entradas, setEntradas]   = useState([]);
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
    fetchEntradas();
  }, []);

  const fetchEntradas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/inventario/entradas`, { headers: authHeader() });
      if (res.ok) setEntradas(await res.json());
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
      const res = await fetch(`${API_URL}/api/inventario/entrada`, {
        method: 'POST', headers: authHeader(), body: data,
      });
      const result = await res.json();
      if (res.ok) {
        showToast('Entrada registrada correctamente');
        setForm(EMPTY);
        fetchEntradas();
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
        <h1>Entradas de inventario</h1>
        <p>Registra compras, devoluciones o ajustes de stock al alza</p>
      </div>

      <div className="entradas-layout">
        {/* Form */}
        <div className="card">
          <h2 className="card-title"><FaArrowDown style={{ color: 'var(--color-success)' }} /> Nueva entrada</h2>
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
                placeholder="Ej. Compra a proveedor, Devolución…" />
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
            <button type="submit" className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
              {saving ? 'Registrando…' : <><FaArrowDown /> Registrar entrada</>}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>Historial de entradas</h2>
          </div>
          {entradas.length === 0
            ? <div className="empty-state"><div className="empty-state-icon"><FaBoxOpen /></div><p>Sin entradas registradas.</p></div>
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
                    {entradas.map(e => {
                      const nombre = productos.find(p => p.id === e.productoId)?.nombre || `#${e.productoId}`;
                      return (
                        <tr key={e.id}>
                          <td style={{ fontSize: '.8rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                            {new Date(e.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td style={{ fontWeight: 500 }}>{nombre}</td>
                          <td>{e.motivo}</td>
                          <td style={{ textAlign: 'center' }}><span className="badge badge-success">{e.cantidad}</span></td>
                          <td style={{ color: 'var(--color-muted)', fontSize: '.85rem' }}>{e.comentario || '—'}</td>
                          <td>
                            {e.imagenUrl
                              ? e.imagenUrl.toLowerCase().endsWith('.pdf')
                                ? <a href={`${API_URL}${e.imagenUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><FaFilePdf /> PDF</a>
                                : <a href={`${API_URL}${e.imagenUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><FaImage /> Ver</a>
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

export default Entradas;
