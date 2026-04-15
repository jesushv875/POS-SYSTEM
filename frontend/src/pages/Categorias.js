import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaTags } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre]         = useState('');
  const [editId, setEditId]         = useState(null);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchCategorias(); }, []);

  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categorias`, { headers: authHeader() });
      if (res.ok) setCategorias(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      const url    = editId ? `${API_URL}/api/categorias/${editId}` : `${API_URL}/api/categorias/agregar`;
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeader(), body: JSON.stringify({ nombre: nombre.trim() }) });
      if (res.ok) {
        showToast(editId ? 'Categoría actualizada' : 'Categoría agregada');
        setNombre(''); setEditId(null);
        fetchCategorias();
      } else {
        showToast('Error al guardar', 'danger');
      }
    } catch (e) {
      showToast('Error de conexión', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try {
      const res = await fetch(`${API_URL}/api/categorias/${id}`, { method: 'DELETE', headers: authHeader() });
      if (res.ok) { showToast('Categoría eliminada'); fetchCategorias(); }
      else showToast('Error al eliminar', 'danger');
    } catch (e) { showToast('Error de conexión', 'danger'); }
  };

  return (
    <div style={{ maxWidth: '560px' }}>
      <h2 className="card-title" style={{ marginBottom: '16px' }}><FaTags /> Gestión de categorías</h2>

      <div className="card" style={{ marginBottom: '16px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>{editId ? 'Editando categoría' : 'Nueva categoría'}</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Analgésicos, Vitaminas…" required />
          </div>
          {editId && (
            <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setNombre(''); }}
              title="Cancelar edición"><FaTimes /></button>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {editId ? <><FaEdit /> Actualizar</> : <><FaPlus /> Agregar</>}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {categorias.length === 0
          ? <div className="empty-state"><p>No hay categorías registradas.</p></div>
          : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: '48px' }}>#</th>
                  <th>Nombre</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--color-muted)', fontSize: '.8rem' }}>{c.id}</td>
                    <td style={{ fontWeight: 500 }}>{c.nombre}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button className="btn btn-warning btn-sm" style={{ marginRight: '6px' }}
                        onClick={() => { setEditId(c.id); setNombre(c.nombre); }}><FaEdit /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default Categorias;
