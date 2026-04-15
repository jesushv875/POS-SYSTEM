import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  FaPlus, FaSearch, FaEdit, FaTrash, FaDownload,
  FaTimes, FaBoxOpen, FaExclamationTriangle,
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const EMPTY_FORM = {
  nombre: '', precio: '', stock: '', stockMinimo: '',
  proveedorId: '', codigoBarras: '', categoriaId: '',
  imagenUrl: '', pasillo: '', anaquel: '', piso: '', imagen: null,
};

function Inventario() {
  const [productos, setProductos]             = useState([]);
  const [productosFiltrados, setFiltrados]    = useState([]);
  const [proveedores, setProveedores]         = useState([]);
  const [categorias, setCategorias]           = useState([]);
  const [busqueda, setBusqueda]               = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStock, setFiltroStock]         = useState('');
  const [form, setForm]                       = useState(EMPTY_FORM);
  const [editId, setEditId]                   = useState(null);
  const [modalOpen, setModalOpen]             = useState(false);
  const [usuarioRol, setUsuarioRol]           = useState('');
  const [loading, setLoading]                 = useState(true);
  const [saving, setSaving]                   = useState(false);
  const [toast, setToast]                     = useState(null);

  const isGerente = usuarioRol === 'gerente' || usuarioRol === 'admin';

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const h = { 'Authorization': `Bearer ${token}` };
      const [pRes, prRes, cRes] = await Promise.all([
        fetch(`${API_URL}/api/productos`,  { headers: h }),
        fetch(`${API_URL}/api/proveedores`,{ headers: h }),
        fetch(`${API_URL}/api/categorias`, { headers: h }),
      ]);
      const [prods, provs, cats] = await Promise.all([pRes.json(), prRes.json(), cRes.json()]);
      setProductos(Array.isArray(prods) ? prods : []);
      setFiltrados(Array.isArray(prods) ? prods : []);
      setProveedores(Array.isArray(provs) ? provs : []);
      setCategorias(Array.isArray(cats)  ? cats  : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) { const d = jwtDecode(token); setUsuarioRol(d.rol || ''); }
    } catch (_) {}
    fetchData();
  }, [fetchData]);

  /* ── Filtering ──────────────────────────────────────────────── */
  useEffect(() => {
    let result = productos;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      result = result.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        (p.codigoBarras || '').toLowerCase().includes(q)
      );
    }
    if (filtroCategoria) {
      result = result.filter(p => String(p.categoriaId) === filtroCategoria);
    }
    if (filtroStock === 'bajo') {
      result = result.filter(p => p.stock <= (p.stockMinimo || 0));
    }
    setFiltrados(result);
  }, [busqueda, filtroCategoria, filtroStock, productos]);

  /* ── Modal helpers ──────────────────────────────────────────── */
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (producto) => {
    setForm({ ...EMPTY_FORM, ...producto, imagen: null });
    setEditId(producto.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  /* ── Form field change ──────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imagen') {
      setForm(f => ({ ...f, imagen: files[0] || null }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const usuarioId = decoded.id;

      const fd = new FormData();
      fd.append('usuarioId',   usuarioId);
      fd.append('nombre',      form.nombre.trim());
      fd.append('codigoBarras',form.codigoBarras?.trim() || '');
      fd.append('precio',      parseFloat(form.precio) || 0);
      fd.append('stock',       parseInt(form.stock)     || 0);
      fd.append('stockMinimo', parseInt(form.stockMinimo) || 0);
      fd.append('proveedorId', form.proveedorId ? parseInt(form.proveedorId) : '');
      fd.append('categoriaId', form.categoriaId ? parseInt(form.categoriaId) : '');
      fd.append('pasillo',     form.pasillo?.trim()  || '');
      fd.append('anaquel',     form.anaquel?.trim()  || '');
      fd.append('piso',        form.piso?.trim()     || '');
      if (form.imagen instanceof File) {
        fd.append('imagen', form.imagen);
      } else {
        fd.append('imagenUrl', form.imagenUrl || '');
      }

      const url    = editId ? `${API_URL}/api/productos/${editId}` : `${API_URL}/api/productos/agregar`;
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();

      if (res.ok) {
        showToast(editId ? 'Producto actualizado' : 'Producto agregado');
        closeModal();
        fetchData();
      } else {
        showToast(data.message || 'Error al guardar', 'danger');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión', 'danger');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ─────────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const res = await fetch(`${API_URL}/api/productos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: decoded.id }),
      });
      if (res.ok) { showToast('Producto eliminado'); fetchData(); }
      else { const d = await res.json(); showToast(d.message || 'Error', 'danger'); }
    } catch (e) {
      showToast('Error de conexión', 'danger');
    }
  };

  /* ── Export CSV ─────────────────────────────────────────────── */
  const exportCSV = () => {
    const headers = ['Código', 'Nombre', 'Precio', 'Stock', 'Stock Mín', 'Categoría', 'Proveedor'];
    const rows = productosFiltrados.map(p => [
      p.codigoBarras, p.nombre, p.precio, p.stock, p.stockMinimo,
      categorias.find(c => c.id === p.categoriaId)?.nombre || '',
      proveedores.find(v => v.id === p.proveedorId)?.nombre || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = 'inventario.csv';
    a.click();
  };

  /* ── Render ─────────────────────────────────────────────────── */
  const bajosStock = productos.filter(p => p.stock <= (p.stockMinimo || 0)).length;

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>Inventario</h1>
          <p>{productos.length} productos registrados
            {bajosStock > 0 && (
              <span style={{ marginLeft: '10px', color: 'var(--color-danger)', fontWeight: 600 }}>
                <FaExclamationTriangle style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                {bajosStock} bajo stock mínimo
              </span>
            )}
          </p>
        </div>
        {isGerente && (
          <button className="btn btn-primary btn-lg" onClick={openAdd}>
            <FaPlus /> Nuevo producto
          </button>
        )}
      </div>

      {/* Filters toolbar */}
      <div className="inventario-filters">
        <div className="search-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre o código…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <select
          value={filtroCategoria}
          onChange={e => setFiltroCategoria(e.target.value)}
          style={{ width: 'auto', minWidth: '150px' }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <select
          value={filtroStock}
          onChange={e => setFiltroStock(e.target.value)}
          style={{ width: 'auto', minWidth: '140px' }}
        >
          <option value="">Todo el stock</option>
          <option value="bajo">Bajo stock</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={exportCSV} title="Exportar CSV">
          <FaDownload /> CSV
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>Cargando productos…</p></div>
        ) : productosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FaBoxOpen /></div>
            <p>{busqueda || filtroCategoria || filtroStock ? 'Sin resultados para los filtros aplicados.' : 'No hay productos registrados.'}</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Categoría</th>
                  <th>Proveedor</th>
                  <th style={{ textAlign: 'right' }}>Precio</th>
                  <th style={{ textAlign: 'center' }}>Stock</th>
                  <th style={{ textAlign: 'center' }}>Mín.</th>
                  <th>Ubicación</th>
                  {isGerente && <th style={{ textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map(p => {
                  const bajStock = p.stock <= (p.stockMinimo || 0);
                  return (
                    <tr key={p.id} className={bajStock ? 'fila-bajo-stock' : ''}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {p.imagenUrl
                            ? <img src={`${API_URL}${p.imagenUrl}`} alt={p.nombre} className="product-thumb" />
                            : <div className="product-thumb-placeholder"><FaBoxOpen /></div>
                          }
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{p.nombre}</div>
                            {bajStock && (
                              <span className="badge badge-danger" style={{ fontSize: '.65rem', marginTop: '2px' }}>
                                <FaExclamationTriangle /> Bajo stock
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '.8rem', color: 'var(--color-muted)' }}>
                          {p.codigoBarras || '—'}
                        </span>
                      </td>
                      <td>{categorias.find(c => c.id === p.categoriaId)?.nombre || '—'}</td>
                      <td>{proveedores.find(v => v.id === p.proveedorId)?.nombre || '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>${parseFloat(p.precio).toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${bajStock ? 'badge-danger' : 'badge-success'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--color-muted)' }}>{p.stockMinimo ?? '—'}</td>
                      <td style={{ fontSize: '.8rem', color: 'var(--color-muted)' }}>
                        {[p.pasillo && `P:${p.pasillo}`, p.anaquel && `A:${p.anaquel}`, p.piso && `N:${p.piso}`]
                          .filter(Boolean).join(' · ') || '—'}
                      </td>
                      {isGerente && (
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button className="btn btn-warning btn-sm" onClick={() => openEdit(p)} style={{ marginRight: '6px' }}>
                            <FaEdit />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                            <FaTrash />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-container modal-lg">
            <div className="modal-header">
              <h2>{editId ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button className="modal-close" onClick={closeModal}><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group span-2">
                  <label>Nombre del producto *</label>
                  <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej. Paracetamol 500mg" />
                </div>

                <div className="form-group">
                  <label>Código de barras</label>
                  <input name="codigoBarras" value={form.codigoBarras} onChange={handleChange} placeholder="7501234567890" />
                </div>

                <div className="form-group">
                  <label>Precio *</label>
                  <input name="precio" type="number" min="0" step="0.01" value={form.precio} onChange={handleChange} required placeholder="0.00" />
                </div>

                <div className="form-group">
                  <label>Stock actual</label>
                  <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} disabled={!editId} placeholder="0" />
                </div>

                <div className="form-group">
                  <label>Stock mínimo</label>
                  <input name="stockMinimo" type="number" min="0" value={form.stockMinimo} onChange={handleChange} placeholder="5" />
                </div>

                <div className="form-group">
                  <label>Categoría *</label>
                  <select name="categoriaId" value={form.categoriaId} onChange={handleChange} required>
                    <option value="">Selecciona categoría</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Proveedor</label>
                  <select name="proveedorId" value={form.proveedorId} onChange={handleChange}>
                    <option value="">Sin proveedor</option>
                    {proveedores.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
                  </select>
                </div>

                <div className="form-group span-2">
                  <label>Ubicación en tienda</label>
                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Pasillo</label>
                      <input name="pasillo" value={form.pasillo} onChange={handleChange} placeholder="A" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Anaquel</label>
                      <input name="anaquel" value={form.anaquel} onChange={handleChange} placeholder="3" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Nivel</label>
                      <input name="piso" value={form.piso} onChange={handleChange} placeholder="2" />
                    </div>
                  </div>
                </div>

                <div className="form-group span-2">
                  <label>Imagen del producto</label>
                  <input name="imagen" type="file" accept="image/*" onChange={handleChange} />
                  {editId && form.imagenUrl && !form.imagen && (
                    <div style={{ marginTop: '8px' }}>
                      <img
                        src={`${API_URL}${form.imagenUrl}`}
                        alt="actual"
                        style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                      />
                      <span style={{ fontSize: '.75rem', color: 'var(--color-muted)', marginLeft: '8px' }}>Imagen actual</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando…' : editId ? 'Actualizar' : 'Agregar producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}

export default Inventario;
