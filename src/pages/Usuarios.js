import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;
const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const ROL_LABELS = { admin: 'Administrador', gerente: 'Gerente', empleado: 'Empleado' };
const ROL_BADGE  = { admin: 'badge-blue', gerente: 'badge-amber', empleado: 'badge-green' };

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', rol: 'empleado' });
  const [editUsuario, setEditUsuario] = useState(null);
  const [usuarioAuth, setUsuarioAuth] = useState({ id: null, rol: null });
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const d = jwtDecode(localStorage.getItem('token'));
      setUsuarioAuth({ id: d.id, rol: d.rol });
    } catch (_) {}
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/api/usuarios`, { headers: authHeader() });
      if (res.ok) setUsuarios(await res.json());
    } catch (_) {}
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (u) => {
    setEditUsuario(u);
    setForm({ nombre: u.nombre, correo: u.correo, password: '', rol: u.rol });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const body = editUsuario
      ? { nombre: form.nombre, correo: form.correo, rol: form.rol }
      : form;
    const url    = editUsuario ? `${API_URL}/api/usuarios/${editUsuario.id}` : `${API_URL}/api/usuarios/agregar`;
    const method = editUsuario ? 'PUT' : 'POST';
    try {
      const res  = await fetch(url, { method, headers: authHeader(), body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        setForm({ nombre: '', correo: '', password: '', rol: 'empleado' });
        setEditUsuario(null);
        fetchUsuarios();
      } else {
        setError(data.error || 'Error al procesar la solicitud');
      }
    } catch (_) { setError('No se pudo conectar con el servidor'); }
  };

  const handleDelete = async (id) => {
    if (id === usuarioAuth.id) { alert('No puedes eliminar tu propio usuario'); return; }
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${id}`, { method: 'DELETE', headers: authHeader() });
      if (res.ok) fetchUsuarios();
      else alert((await res.json()).error || 'Error al eliminar');
    } catch (_) { alert('No se pudo conectar'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <p>Administra el acceso al sistema por roles</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', alignItems: 'start' }}>
        <div className="card">
          <h2 className="card-title">
            {editUsuario ? 'Editar usuario' : <><FaUserPlus style={{ marginRight: '6px' }} />Nuevo usuario</>}
          </h2>

          {error && (
            <div style={{ background: '#fef2f2', color: '#991b1b', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input type="email" name="correo" value={form.correo} onChange={handleChange} required />
            </div>
            {!editUsuario && (
              <div className="form-group">
                <label>Contraseña</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} placeholder="Mínimo 6 caracteres" />
              </div>
            )}
            <div className="form-group">
              <label>Rol</label>
              <select name="rol" value={form.rol} onChange={handleChange} required>
                <option value="admin">Administrador — acceso total</option>
                <option value="gerente">Gerente — operaciones y reportes</option>
                <option value="empleado">Empleado — solo ventas</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                {editUsuario ? 'Guardar cambios' : 'Crear usuario'}
              </button>
              {editUsuario && (
                <button type="button" className="btn btn-ghost" onClick={() => { setEditUsuario(null); setForm({ nombre: '', correo: '', password: '', rol: 'empleado' }); setError(''); }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h2 className="card-title">Usuarios registrados</h2>
          {usuarios.length === 0
            ? <p style={{ color: 'var(--color-muted)' }}>No hay usuarios registrados.</p>
            : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u.nombre}</div>
                          {u.id === usuarioAuth.id && <span style={{ fontSize: '.72rem', color: 'var(--color-muted)' }}>Tú</span>}
                        </td>
                        <td style={{ color: 'var(--color-muted)', fontSize: '.875rem' }}>{u.correo}</td>
                        <td><span className={`badge ${ROL_BADGE[u.rol] || 'badge-blue'}`}>{ROL_LABELS[u.rol] || u.rol}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-warning btn-sm" onClick={() => handleEdit(u)}>
                              <FaEdit /> Editar
                            </button>
                            {u.id !== usuarioAuth.id && (
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default Usuarios;
