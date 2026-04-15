import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaTruck, FaDownload } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const EMPTY = { nombre: '', telefono: '', email: '', direccion: '' };

function AgregarProveedor() {
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm]               = useState(EMPTY);
  const [editId, setEditId]           = useState(null);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { obtenerProveedores(); }, []);

  const obtenerProveedores = async () => {
    try {
      const res  = await fetch(`${API_URL}/api/proveedores`, { headers: authHeader() });
      const data = await res.json();
      setProveedores(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error al obtener proveedores:', e);
      setProveedores([]);
    }
  };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const url    = editId ? `${API_URL}/api/proveedores/${editId}` : `${API_URL}/api/proveedores/agregar`;
    const method = editId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: authHeader(), body: JSON.stringify(form) });
      if (res.ok) {
        showToast(editId ? 'Proveedor actualizado' : 'Proveedor agregado');
        setForm(EMPTY);
        setEditId(null);
        obtenerProveedores();
      } else {
        showToast('Error al guardar el proveedor', 'danger');
      }
    } catch (e) {
      showToast('Error de conexión', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este proveedor?')) return;
    try {
      const res = await fetch(`${API_URL}/api/proveedores/${id}`, { method: 'DELETE', headers: authHeader() });
      if (res.ok) { showToast('Proveedor eliminado'); obtenerProveedores(); }
      else showToast('Error al eliminar', 'danger');
    } catch (e) {
      showToast('Error de conexión', 'danger');
    }
  };

  const startEdit = (prov) => {
    setEditId(prov.id);
    setForm({ nombre: prov.nombre, telefono: prov.telefono || '', email: prov.email || '', direccion: prov.direccion || '' });
  };

  const cancelEdit = () => { setEditId(null); setForm(EMPTY); };

  const downloadCSV = () => {
    const rows = [
      ['Nombre', 'Teléfono', 'Email', 'Dirección'],
      ...proveedores.map(p => [p.nombre, p.telefono || '', p.email || '', p.direccion || '']),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = 'proveedores.csv';
    a.click();
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>Proveedores</h1>
          <p>{proveedores.length} proveedores registrados</p>
        </div>
        {proveedores.length > 0 && (
          <button className="btn btn-ghost" onClick={downloadCSV}><FaDownload /> CSV</button>
        )}
      </div>

      <div className="entradas-layout">
        {/* Form */}
        <div className="card">
          <h2 className="card-title">
            <FaTruck /> {editId ? 'Editar proveedor' : 'Nuevo proveedor'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre *</label>
              <input name="nombre" type="text" value={form.nombre} onChange={handleChange} required placeholder="Ej. Distribuidora Central" />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input name="telefono" type="text" value={form.telefono} onChange={handleChange} placeholder="Ej. 81 1234 5678" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="contacto@proveedor.com" />
            </div>
            <div className="form-group">
              <label>Dirección</label>
              <input name="direccion" type="text" value={form.direccion} onChange={handleChange} placeholder="Ej. Av. Industrial #45, Col. Norte" />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {editId && (
                <button type="button" className="btn btn-ghost" onClick={cancelEdit}><FaTimes /> Cancelar</button>
              )}
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
                {saving ? 'Guardando…' : editId ? <><FaEdit /> Actualizar</> : <><FaPlus /> Agregar</>}
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>Lista de proveedores</h2>
          </div>
          {proveedores.length === 0
            ? (
              <div className="empty-state">
                <div className="empty-state-icon"><FaTruck /></div>
                <p>No hay proveedores registrados.</p>
              </div>
            )
            : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th>Dirección</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedores.map(prov => (
                      <tr key={prov.id}>
                        <td style={{ fontWeight: 600 }}>{prov.nombre}</td>
                        <td style={{ color: 'var(--color-muted)' }}>{prov.telefono || '—'}</td>
                        <td style={{ color: 'var(--color-muted)', fontSize: '.85rem' }}>{prov.email || '—'}</td>
                        <td style={{ color: 'var(--color-muted)', fontSize: '.85rem' }}>{prov.direccion || '—'}</td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button className="btn btn-warning btn-sm" style={{ marginRight: '6px' }} onClick={() => startEdit(prov)}>
                            <FaEdit />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(prov.id)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
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

export default AgregarProveedor;
