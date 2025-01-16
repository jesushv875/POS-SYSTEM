import React, { useEffect, useState } from 'react';

function ProductoList() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/productos');
        if (response.ok) {
          const data = await response.json();
          console.log(data); // Para verificar que llegan los datos
          setProductos(data); // Actualiza el estado con los productos
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
    <div>
      <h1>Lista de Productos</h1>
      {productos.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <ul>
          {productos.map((producto) => (
            <li key={producto.id}>
              {producto.nombre} - ${producto.precio} - Stock: {producto.stock}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductoList;