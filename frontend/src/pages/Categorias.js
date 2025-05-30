import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [editCategoria, setEditCategoria] = useState(null);

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const obtenerCategorias = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categorias`);
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      let data;

      if (editCategoria) {
        response = await fetch(`${API_URL}/api/categorias/${editCategoria.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: nuevaCategoria }),
        });
        data = await response.json();
      } else {
        response = await fetch(`${API_URL}/api/categorias/agregar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: nuevaCategoria }),
        });
        data = await response.json();
      }

      if (response.ok) {
        alert(editCategoria ? 'Categoría actualizada' : 'Categoría agregada');
        setNuevaCategoria('');
        setEditCategoria(null);
        obtenerCategorias();
      } else {
        alert('Error al procesar la categoría');
      }
    } catch (error) {
      console.error('Error al procesar la categoría:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que quieres eliminar esta categoría?')) {
      try {
        const response = await fetch(`${API_URL}/api/categorias/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Categoría eliminada');
          obtenerCategorias();
        } else {
          alert('Error al eliminar la categoría');
        }
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
      }
    }
  };

  return (
    <div className="container">
      <h1>Gestión de Categorías</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={nuevaCategoria}
          onChange={(e) => setNuevaCategoria(e.target.value)}
          required
        />
        <button type="submit">{editCategoria ? 'Actualizar' : 'Agregar'}</button>
      </form>

      {categorias.length === 0 ? (
        <p>No hay categorías registradas.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td>{categoria.id}</td>
                <td>{categoria.nombre}</td>
                <td>
                  <button onClick={() => setEditCategoria(categoria)}>Editar</button>
                  <button onClick={() => handleDelete(categoria.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Categorias;