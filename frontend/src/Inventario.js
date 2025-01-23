import React, { useEffect, useState } from 'react';
import './css/App.css'; // Importa los estilos

function Inventario() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/productos');
        if (response.ok) {
          const data = await response.json();
          setProductos(data);
        } else {
          console.error('Error al obtener productos');
        }
      } catch (error) {
        console.error('Error al conectar con la API:', error);
      }
    };

    fetchProductos();
  }, []);

  return (
    <div className="container">
      <h1>Inventario</h1>
      {productos.length === 0 ? (
        <p>No hay productos en el inventario.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Proveedor</th>

            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td>{producto.nombre}</td>
                <td>${producto.precio}</td>
                <td>{producto.stock}</td>
                <td>{producto.proveedor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Inventario;