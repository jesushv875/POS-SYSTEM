import React, { useState, useEffect } from 'react';

function AgregarProveedor() {
  const [proveedor, setProveedor] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
  });

  const [proveedores, setProveedores] = useState([]); // Estado para la lista de proveedores
  const [editando, setEditando] = useState(null); // Estado para manejar edición

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const obtenerProveedores = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/proveedores');
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProveedor({ ...proveedor, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = editando 
      ? `http://localhost:5001/api/proveedores/${editando.id}`
      : 'http://localhost:5001/api/proveedores/agregar';

    const method = editando ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proveedor),
      });

      if (response.ok) {
        alert(editando ? 'Proveedor actualizado' : 'Proveedor agregado');
        setProveedor({ nombre: '', telefono: '', email: '', direccion: '' });
        setEditando(null);
        obtenerProveedores();
      } else {
        alert('Error al guardar el proveedor');
      }
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
    }
  };

  const handleEdit = (prov) => {
    setProveedor(prov);
    setEditando(prov);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este proveedor?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/proveedores/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Proveedor eliminado');
        obtenerProveedores();
      } else {
        alert('Error al eliminar proveedor');
      }
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
    }
  };

  // Función para descargar los datos como CSV
  const downloadCSV = () => {
    const csvRows = [];
    
    // Cabeceras de las columnas
    const headers = ['Nombre', 'Teléfono', 'Email', 'Dirección'];
    csvRows.push(headers.join(','));

    // Datos de los proveedores
    proveedores.forEach((prov) => {
      const row = [prov.nombre, prov.telefono, prov.email, prov.direccion];
      csvRows.push(row.join(','));
    });

    // Crear un Blob de tipo CSV
    const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });

    // Crear un enlace de descarga
    const csvUrl = URL.createObjectURL(csvBlob);
    const a = document.createElement('a');
    a.href = csvUrl;
    a.download = 'proveedores.csv';
    a.click();
    URL.revokeObjectURL(csvUrl); // Limpiar el enlace después de la descarga
  };

  return (
    <div className="container">
      <h2>{editando ? 'Editar Proveedor' : 'Agregar Proveedor'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input type="text" name="nombre" value={proveedor.nombre} onChange={handleChange} required />
        </div>
        <div>
          <label>Teléfono:</label>
          <input type="text" name="telefono" value={proveedor.telefono} onChange={handleChange} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={proveedor.email} onChange={handleChange} />
        </div>
        <div>
          <label>Dirección:</label>
          <textarea name="direccion" value={proveedor.direccion} onChange={handleChange}></textarea>
        </div>
        <button type="submit">{editando ? 'Actualizar' : 'Agregar'}</button>
      </form>

      <h2>Lista de Proveedores</h2>
      <button onClick={downloadCSV}>Descargar CSV</button>

      <table border="1">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((prov) => (
            <tr key={prov.id}>
              <td>{prov.nombre}</td>
              <td>{prov.telefono}</td>
              <td>{prov.email}</td>
              <td>{prov.direccion}</td>
              <td>
                <button onClick={() => handleEdit(prov)}>Editar</button>
                <button onClick={() => handleDelete(prov.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AgregarProveedor;