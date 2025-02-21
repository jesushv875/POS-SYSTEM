import React, { useState, useEffect } from 'react';
import './css/App.css'; // Importa los estilos

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]); // Lista filtrada
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState(''); // Estado del buscador
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: '',
    stock: '',
    proveedorId: '',
  });
  const [editProducto, setEditProducto] = useState(null);

  const usuarioRol = 'admin';

  const fetchData = async () => {
    try {
      const productosResponse = await fetch('http://localhost:5001/api/productos');
      const proveedoresResponse = await fetch('http://localhost:5001/api/proveedores');

      if (productosResponse.ok && proveedoresResponse.ok) {
        const productosData = await productosResponse.json();
        setProductos(productosData);
        setProductosFiltrados(productosData); // Inicialmente, productosFiltrados será igual a productos
        setProveedores(await proveedoresResponse.json());
      } else {
        console.error('Error al obtener datos');
      }
    } catch (error) {
      console.error('Error al conectar con la API:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función para manejar la búsqueda en tiempo real
  const handleSearch = (e) => {
    const valor = e.target.value.toLowerCase();
    setBusqueda(valor);

    if (valor === '') {
      setProductosFiltrados(productos);
    } else {
      const productosFiltrados = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(valor)
      );
      setProductosFiltrados(productosFiltrados);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editProducto) {
      setEditProducto({ ...editProducto, [name]: value });
    } else {
      setNuevoProducto({ ...nuevoProducto, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      let data;

      if (editProducto) {
        response = await fetch(`http://localhost:5001/api/productos/${editProducto.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editProducto),
        });
      } else {
        response = await fetch('http://localhost:5001/api/productos/agregar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoProducto),
        });
      }

      data = await response.json();

      if (response.ok) {
        alert(editProducto ? 'Producto actualizado correctamente' : 'Producto agregado correctamente');
        fetchData();
        setEditProducto(null);
        setNuevoProducto({ nombre: '', precio: '', stock: '', proveedorId: '' });
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error al procesar producto:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;

    try {
      const response = await fetch(`http://localhost:5001/api/productos/${id}`, { method: 'DELETE' });

      if (response.ok) {
        alert('Producto eliminado correctamente');
        fetchData();
      } else {
        alert('Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  const handleEdit = (producto) => {
    setEditProducto(producto);
  };

  return (
    <div className="container">
      <h1>Inventario</h1>

      {/* Campo de búsqueda */}
      <input
        type="text"
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={handleSearch}
        className="search-input"
      />

      <h2>{editProducto ? 'Editar Producto' : 'Agregar Producto'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre del Producto:</label>
          <input
            type="text"
            name="nombre"
            value={editProducto ? editProducto.nombre : nuevoProducto.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Precio:</label>
          <input
            type="number"
            name="precio"
            value={editProducto ? editProducto.precio : nuevoProducto.precio}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Stock:</label>
          <input
            type="number"
            name="stock"
            value={editProducto ? editProducto.stock : nuevoProducto.stock}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Proveedor:</label>
          <select
            name="proveedorId"
            value={editProducto ? editProducto.proveedorId : nuevoProducto.proveedorId}
            onChange={handleChange}
            required
            className="styled-select"
          >
            <option value="">Selecciona un proveedor</option>
            {proveedores.map((proveedor) => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.nombre}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">{editProducto ? 'Actualizar Producto' : 'Agregar Producto'}</button>
      </form>

      {productosFiltrados.length === 0 ? (
        <p>No hay productos que coincidan con la búsqueda.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Proveedor</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td>{producto.nombre}</td>
                <td>${producto.precio}</td>
                <td>{producto.stock}</td>
                <td>{proveedores.find((p) => p.id === producto.proveedorId)?.nombre || 'N/A'}</td>
                <td>
                  {usuarioRol === 'admin' && (
                    <>
                      <button className="edit-btn" onClick={() => handleEdit(producto)}>Editar</button>
                      <button className="delete-btn" onClick={() => handleDelete(producto.id)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Inventario;