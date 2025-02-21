import React, { useState, useEffect } from 'react';
import '../css/App.css'; // Asegúrate de tener los estilos

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    correo: '',
    password: '',
    rol: 'usuario', // Valor por defecto
  });
  const [editUsuario, setEditUsuario] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        console.error('Error al obtener usuarios');
      }
    } catch (error) {
      console.error('Error al conectar con la API:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editUsuario) {
      setEditUsuario({ ...editUsuario, [name]: value });
    } else {
      setNuevoUsuario({ ...nuevoUsuario, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      let data;

      if (editUsuario) {
        // Actualizar usuario
        response = await fetch(`http://localhost:5001/api/usuarios/${editUsuario.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editUsuario),
        });
      } else {
        // Agregar usuario
        response = await fetch('http://localhost:5001/api/usuarios/agregar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoUsuario),
        });
      }

      data = await response.json();
      if (response.ok) {
        alert(editUsuario ? 'Usuario actualizado' : 'Usuario agregado');
        setNuevoUsuario({ nombre: '', correo: '', password: '', rol: 'usuario' });
        setEditUsuario(null);
        fetchUsuarios(); // Recargar la lista de usuarios
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este usuario?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/usuarios/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Usuario eliminado correctamente');
          fetchUsuarios(); // Recargar la lista de usuarios
        } else {
          alert('Error al eliminar el usuario');
        }
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('No se pudo conectar con el servidor.');
      }
    }
  };

  const handleEdit = (usuario) => {
    setEditUsuario(usuario);
  };

  return (
    <div className="container">
      <h1>Gestión de Usuarios</h1>

      <h2>{editUsuario ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={editUsuario ? editUsuario.nombre : nuevoUsuario.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Correo:</label>
          <input
            type="email"
            name="correo"
            value={editUsuario ? editUsuario.correo : nuevoUsuario.correo}
            onChange={handleChange}
            required
          />
        </div>
        {!editUsuario && (
          <div>
            <label>Contraseña:</label>
            <input
              type="password"
              name="password"
              value={nuevoUsuario.password}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div>
          <label>Rol:</label>
          <select
            name="rol"
            value={editUsuario ? editUsuario.rol : nuevoUsuario.rol}
            onChange={handleChange}
            required
            className="styled-select"
          >
            <option value="admin">Admin</option>
            <option value="usuario">Usuario</option>
          </select>
        </div>
        <button type="submit">{editUsuario ? 'Actualizar Usuario' : 'Agregar Usuario'}</button>
      </form>

      {usuarios.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.correo}</td>
                <td>{usuario.rol}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(usuario)}>
                    Editar
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(usuario.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Usuarios;