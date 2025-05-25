import React, { useState, useEffect, useRef } from 'react';
  import { jwtDecode } from 'jwt-decode';

  function Ventas() {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [carrito, setCarrito] = useState([]);
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [montoEfectivo, setMontoEfectivo] = useState('');
    const [montoTarjeta, setMontoTarjeta] = useState('');
    const [pagoCliente, setPagoCliente] = useState('');
    const [ventaFinalizada, setVentaFinalizada] = useState(null);
    const ticketRef = useRef(null);
    const [categorias, setCategorias] = useState([]);
    const [usuarioId, setUsuarioId] = useState(null);

    useEffect(() => {
      obtenerProductos();
      obtenerCategorias();
      obtenerUsuarioId();
    }, []);

    const obtenerUsuarioId = () => {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setUsuarioId(decoded.id);
      }
    };

    const obtenerProductos = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/productos');
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };

    const obtenerCategorias = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/categorias');
        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error('Error al obtener categorías:', error);
      }
    };

    const handleBusqueda = (e) => setBusqueda(e.target.value);

    const agregarAlCarrito = (producto) => {
      const cantidad = prompt(`¿Cuántas unidades de "${producto.nombre}" desea agregar?`);
      const cantidadInt = parseInt(cantidad, 10);

      if (isNaN(cantidadInt) || cantidadInt <= 0) {
        alert('Cantidad inválida');
        return;
      }

      const enCarrito = carrito.find((item) => item.id === producto.id);
      const cantidadEnCarrito = enCarrito ? enCarrito.cantidad : 0;
      const totalDisponible = producto.stock - cantidadEnCarrito;

      if (cantidadInt > totalDisponible) {
        alert(`Stock insuficiente. Solo puedes agregar ${totalDisponible} unidades más.`);
        return;
      }

      if (enCarrito) {
        setCarrito(carrito.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidadInt } : item
        ));
      } else {
        setCarrito([...carrito, { ...producto, cantidad: cantidadInt }]);
      }
    };

    const eliminarDelCarrito = (index) => {
      const nuevoCarrito = [...carrito];
      nuevoCarrito.splice(index, 1);
      setCarrito(nuevoCarrito);
    };

    const calcularTotal = () => carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);

    const calcularCambio = () => {
      if (metodoPago === 'efectivo' || metodoPago === 'tarjeta') {
        const pagado = parseFloat(pagoCliente || 0);
        return pagado - calcularTotal();
      }
      // Si es mixto
      let efectivo = parseFloat(montoEfectivo || 0);
      let tarjeta = parseFloat(montoTarjeta || 0);
      const totalPagado = efectivo + tarjeta;
      return totalPagado - calcularTotal();
    };

    const finalizarVenta = async () => {
      if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
      }
    
      const totalVenta = calcularTotal();
    
      let efectivo = 0;
      let tarjeta = 0;
      let montoPagado = 0;
    
      if (metodoPago === 'efectivo') {
        efectivo = parseFloat(pagoCliente);
        montoPagado = efectivo;
      } else if (metodoPago === 'tarjeta') {
        tarjeta = parseFloat(pagoCliente);
        if (tarjeta > totalVenta) {
          alert('En tarjeta no puedes exceder el total de la venta');
          return;
        }
        montoPagado = tarjeta;
      } else if (metodoPago === 'mixto') {
        efectivo = parseFloat(montoEfectivo || 0);
        tarjeta = parseFloat(montoTarjeta || 0);
        if (tarjeta > (totalVenta - efectivo)) {
          alert('En tarjeta no puedes exceder el total restante después de efectivo');
          return;
        }
        montoPagado = efectivo + tarjeta;
      }
    
      if (montoPagado < totalVenta) {
        alert('El pago es insuficiente');
        return;
      }
    
      const cambioCalculado = montoPagado - totalVenta;
    
      const venta = {
        usuarioId,
        total: totalVenta,
        metodoPago,
        pagoTarjeta: tarjeta,
        montoPagado,
        cambio: cambioCalculado,
        productos: carrito.map((item) => ({
          id: item.id,
          cantidad: item.cantidad,
          precio: item.precio,
        })),
      };
    
      try {
        const response = await fetch('http://localhost:5001/api/ventas/nueva', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(venta),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          const ventaData = {
            ...data,
            productos: carrito,
          };
          setVentaFinalizada(ventaData);
          alert('Venta registrada');
          setCarrito([]);
          setPagoCliente('');
          setMontoEfectivo('');
          setMontoTarjeta('');
          setMetodoPago('efectivo');
          // setVentaFinalizada(null);
          obtenerProductos();
        } else {
          alert('Error al registrar la venta');
        }
      } catch (error) {
        console.error('Error al registrar venta:', error);
      }
    };

    const handlePrint = () => {
      if (!ventaFinalizada || !ticketRef.current) {
        console.error("No se encontró el ticket para imprimir");
        return;
      }

      const ventana = window.open('', 'PRINT', 'height=400,width=300');
      ventana.document.write('<html><head><title>Ticket</title>');
      ventana.document.write('<style>body{ font-family: Arial; width: 250px; }</style>');
      ventana.document.write('</head><body>');
      ventana.document.write(ticketRef.current.innerHTML);
      ventana.document.write('</body></html>');
      ventana.document.close();
      ventana.focus();
      ventana.print();
      ventana.close();
    };

    return (
      <div className="container">
        <h1>Punto de Venta</h1>

        <input type="text" placeholder="Buscar producto..." value={busqueda} onChange={handleBusqueda} className="search-input" />

        <table border="1">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
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
                producto.codigoBarras?.toLowerCase().includes(busqueda.toLowerCase())
              )
              .map((producto) => (
                <tr key={producto.id} style={{ backgroundColor: producto.stock <= 5 ? 'lightcoral' : 'white' }}>
                  <td>{producto.codigoBarras}</td>
                  <td>{producto.nombre}</td>
                  <td>{categorias.find(cat => cat.id === producto.categoriaId)?.nombre || 'Sin categoría'}</td>
                  <td>${producto.precio}</td>
                  <td>{producto.stock}</td>
                  <td>
                    {producto.imagenUrl ? (
                      <img src={producto.imagenUrl} alt={producto.nombre} width="50" height="50" />
                    ) : (
                      <span>Sin imagen</span>
                    )}
                  </td>
                  <td><button onClick={() => agregarAlCarrito(producto)}>Agregar</button></td>
                </tr>
              ))}
          </tbody>
        </table>

        <h2>Carrito</h2>
        {carrito.length === 0 ? <p>No hay productos en el carrito.</p> : (
          <table border="1">
            <thead>
              <tr>
                <th>Producto</th>
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
                  <td>${(item.precio * item.cantidad).toFixed(2)}</td>
                  <td><button onClick={() => eliminarDelCarrito(index)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>Total: ${calcularTotal().toFixed(2)}</h3>

        <div>
          <label>Método de pago: </label>
          <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="mixto">Mixto</option>
          </select>
        </div>

        {metodoPago === 'efectivo' && (
          <div>
            <input type="number" placeholder="Pago en efectivo" value={pagoCliente} onChange={(e) => setPagoCliente(e.target.value)} />
          </div>
        )}

        {metodoPago === 'tarjeta' && (
          <div>
            <input type="number" placeholder="Pago con tarjeta" value={pagoCliente} onChange={(e) => setPagoCliente(e.target.value)} />
          </div>
        )}

        {metodoPago === 'mixto' && (
          <div>
            <input type="number" placeholder="Efectivo" value={montoEfectivo} onChange={(e) => setMontoEfectivo(e.target.value)} />
            <input type="number" placeholder="Tarjeta" value={montoTarjeta} onChange={(e) => setMontoTarjeta(e.target.value)} />
          </div>
        )}

        <h3>Cambio: ${calcularCambio().toFixed(2)}</h3>
        <button onClick={finalizarVenta}>Finalizar Venta</button>

        {ventaFinalizada && (
          <div>
            <h2>Ticket de Compra</h2>
            <div ref={ticketRef} style={{ width: '250px', textAlign: 'center', fontSize: '12px', border: '1px solid #000', padding: '10px' }}>
              <h3>*** TICKET DE COMPRA ***</h3>
              <p>Fecha: {new Date().toLocaleString()}</p>
              <p>Vendedor: {usuarioId ? usuarioId : 'No identificado'}</p>
              <hr />
              {ventaFinalizada.productos.map((item, idx) => (
                <div key={idx} style={{ marginBottom: '5px' }}>
                  <p>{item.nombre} x{item.cantidad}  ${item.precio.toFixed(2)}</p>
                  <p>Subtotal: ${(item.precio * item.cantidad).toFixed(2)}</p>
                </div>
              ))}
              <hr />
              <p><strong>Total: ${parseFloat(ventaFinalizada.total).toFixed(2)}</strong></p>
              <p>Método: {ventaFinalizada.metodoPago}</p>
              {ventaFinalizada.metodoPago === 'mixto' ? (
                <>
                  <p>Efectivo: ${parseFloat(ventaFinalizada.pagoEfectivo).toFixed(2)}</p>
                  <p>Tarjeta: ${parseFloat(ventaFinalizada.pagoTarjeta).toFixed(2)}</p>
                </>
              ) : (
                <p>Pagado: ${parseFloat(ventaFinalizada.montoPagado).toFixed(2)}</p>
              )}
              <p>Cambio: ${parseFloat(ventaFinalizada.cambio).toFixed(2)}</p>
              <p>¡Gracias por su compra!</p>
            </div>
            <button onClick={handlePrint} style={{ marginTop: '10px' }}>Imprimir Ticket</button>
          </div>
        )}
      </div>
    );
  }

  export default Ventas;