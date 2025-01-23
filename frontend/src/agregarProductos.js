import './App.css';  // Importa los estilos
import React, { useState } from 'react';

function AgregarProductos() {
  const [producto, setProducto] = useState({
    nombre: '',
    precio: '',
    stock: '',
    proveedor: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto),
      });
      if (response.ok) {
        alert('Producto agregado exitosamente');
        setProducto({ nombre: '', precio: '', stock: '', proveedor: '' });
      } else {
        alert('Error al agregar producto');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container">
      <h1>Agregar Productos</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={producto.nombre}
            placeholder="Nombre del producto"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="precio">Precio</label>
          <input
            type="number"
            name="precio"
            value={producto.precio}
            placeholder="Precio del producto"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="stock">Stock</label>
          <input
            type="number"
            name="stock"
            value={producto.stock}
            placeholder="Stock"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="proveedor">Proveedor</label>
          <input
            type="text"
            name="proveedor"
            value={producto.proveedor}
            placeholder="Proveedor"
            onChange={handleChange}
            //required
          />
        </div>
        <button type="submit">Agregar Producto</button>
      </form>
    </div>
  );
}

export default AgregarProductos;