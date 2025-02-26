import React, { useState, useEffect } from 'react';

function Ventas() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [pagoCliente, setPagoCliente] = useState('');

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/productos');
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  const handleBusqueda = (e) => {
    setBusqueda(e.target.value);
  };

  const agregarAlCarrito = (producto) => {
    const cantidad = prompt(`¿Cuántas unidades de "${producto.nombre}" desea agregar?`);
    const cantidadInt = parseInt(cantidad, 10);

    if (isNaN(cantidadInt) || cantidadInt <= 0) {
      alert('Ingrese una cantidad válida');
      return;
    }

    const enCarrito = carrito.find((item) => item.id === producto.id);
    const cantidadEnCarrito = enCarrito ? enCarrito.cantidad : 0;
    const totalDeseado = cantidadEnCarrito + cantidadInt;

    if (totalDeseado > producto.stock) {
      alert(`No puedes agregar más de ${producto.stock} unidades de "${producto.nombre}". Ya tienes ${cantidadEnCarrito} en el carrito.`);
      return;
    }

    if (enCarrito) {
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id ? { ...item, cantidad: totalDeseado } : item
        )
      );
    } else {
      setCarrito([...carrito, { ...producto, cantidad: cantidadInt }]);
    }
  };

  const eliminarDelCarrito = (index) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

  const calcularCambio = () => {
    return pagoCliente ? parseFloat(pagoCliente) - calcularTotal() : 0;
  };

  return (
    <div className="container">
      <h1>Punto de Venta</h1>

      <h2>Carrito</h2>
      {carrito.length === 0 ? (
        <p>No hay productos en el carrito.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {carrito.map((item, index) => (
              <tr key={index}>
                <td>{item.nombre}</td>
                <td>{item.cantidad}</td>
                <td>${item.precio}</td>
                <td>${item.precio * item.cantidad}</td>
                <td>
                  <button onClick={() => eliminarDelCarrito(index)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Total: ${calcularTotal()}</h3>
      <input
        type="number"
        placeholder="Pago del cliente"
        value={pagoCliente}
        onChange={(e) => setPagoCliente(e.target.value)}
      />
      <h3>Cambio: ${calcularCambio()}</h3>

      <input
        type="text"
        placeholder="Buscar producto por nombre o código de barras..."
        value={busqueda}
        onChange={handleBusqueda}
        className="search-input"
      />

      <table border="1">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Imagen</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {productos
            .filter((producto) =>
              producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
              producto.codigoBarras.toLowerCase().includes(busqueda.toLowerCase())
            )
            .map((producto) => (
              <tr key={producto.id}>
                <td>{producto.codigoBarras}</td>
                <td>{producto.nombre}</td>
                <td>${producto.precio}</td>
                <td>{producto.stock}</td>
                <td><img src={producto.imagenUrl} alt={producto.nombre} width="100" height="100" /></td>
                <td>
                  <button onClick={() => agregarAlCarrito(producto)}>Agregar</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default Ventas;