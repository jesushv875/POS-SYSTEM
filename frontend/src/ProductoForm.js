import React, { useState } from 'react';

function ProductoForm() {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [proveedorId, setProveedorId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const producto = { nombre, precio: parseFloat(precio), stock: parseInt(stock), proveedorId: parseInt(proveedorId) };
    
    const response = await fetch('http://localhost:5001/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto),
    });

    if (response.ok) {
      alert('Producto agregado');
    } else {
      alert('Error al agregar producto');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <input type="number" placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} />
      <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
      <input type="number" placeholder="ID Proveedor" value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} />
      <button type="submit">Agregar Producto</button>
    </form>
  );
}

export default ProductoForm;