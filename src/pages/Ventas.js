import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { FaShoppingCart, FaSearch, FaTrash, FaPrint, FaPlus, FaMinus, FaTag } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

function Ventas() {
  const [productos, setProductos]         = useState([]);
  const [categorias, setCategorias]       = useState([]);
  const [busqueda, setBusqueda]           = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [carrito, setCarrito]             = useState([]);
  const [metodoPago, setMetodoPago]       = useState('efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [montoTarjeta, setMontoTarjeta]   = useState('');
  const [pagoCliente, setPagoCliente]     = useState('');
  const [descuentoTipo, setDescuentoTipo] = useState('porcentaje');
  const [descuentoValor, setDescuentoValor] = useState('');
  const [ventaFinalizada, setVentaFinalizada] = useState(null);
  const [cajaAbierta, setCajaAbierta]     = useState(null);
  const [cargandoCaja, setCargandoCaja]   = useState(true);
  const [usuarioNombre, setUsuarioNombre] = useState('');
  const ticketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try { const d = jwtDecode(token); setUsuarioNombre(d.nombre || ''); } catch (_) {}
    }
    verificarCaja();
    obtenerProductos();
    obtenerCategorias();
  }, []);

  const verificarCaja = async () => {
    try {
      const res = await fetch(`${API_URL}/api/caja/hoy`, { headers: authHeader() });
      setCajaAbierta(res.ok ? await res.json() : null);
    } catch (_) { setCajaAbierta(null); }
    finally { setCargandoCaja(false); }
  };

  const obtenerProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/productos`, { headers: authHeader() });
      setProductos(res.ok ? await res.json() : []);
    } catch (e) { console.error(e); }
  };

  const obtenerCategorias = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categorias`, { headers: authHeader() });
      setCategorias(res.ok ? await res.json() : []);
    } catch (e) { console.error(e); }
  };

  /* ── Cart ──────────────────────────────────────────────────── */
  const agregarAlCarrito = (producto) => {
    const enCarrito = carrito.find(i => i.id === producto.id);
    const yaEnCarrito = enCarrito ? enCarrito.cantidad : 0;
    if (yaEnCarrito >= producto.stock) { alert(`Stock insuficiente. Disponible: ${producto.stock}`); return; }
    setCarrito(prev =>
      enCarrito
        ? prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
        : [...prev, { ...producto, cantidad: 1 }]
    );
    setBusqueda('');
  };

  const cambiarCantidad = (index, delta) => {
    setCarrito(prev => {
      const item = prev[index];
      const nueva = item.cantidad + delta;
      if (nueva <= 0) return prev.filter((_, i) => i !== index);
      if (nueva > item.stock) return prev;
      return prev.map((i, idx) => idx === index ? { ...i, cantidad: nueva } : i);
    });
  };

  /* ── Barcode: press Enter to add exact match ───────────────── */
  const handleSearchKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const q = busqueda.trim().toLowerCase();
    if (!q) return;
    const exacto = productos.find(p => (p.codigoBarras || '').toLowerCase() === q);
    if (exacto) { agregarAlCarrito(exacto); return; }
    const resultados = productos.filter(p =>
      p.nombre.toLowerCase().includes(q) || (p.codigoBarras || '').toLowerCase().includes(q)
    );
    if (resultados.length === 1) agregarAlCarrito(resultados[0]);
  };

  /* ── Totals ────────────────────────────────────────────────── */
  const subtotal = carrito.reduce((t, i) => t + i.precio * i.cantidad, 0);

  const calcularDescuento = () => {
    const val = parseFloat(descuentoValor) || 0;
    if (!val) return 0;
    return descuentoTipo === 'porcentaje' ? subtotal * (val / 100) : Math.min(val, subtotal);
  };

  const total = subtotal - calcularDescuento();

  const calcularCambio = () => {
    if (metodoPago === 'mixto') return (parseFloat(montoEfectivo || 0) + parseFloat(montoTarjeta || 0)) - total;
    return parseFloat(pagoCliente || 0) - total;
  };

  /* ── Finalize ──────────────────────────────────────────────── */
  const finalizarVenta = async () => {
    if (!cajaAbierta) { alert('No hay caja abierta.'); return; }
    if (carrito.length === 0) { alert('El carrito está vacío'); return; }

    let efectivo = 0, tarjeta = 0, montoPagado = 0;
    if (metodoPago === 'efectivo')      { efectivo = parseFloat(pagoCliente); montoPagado = efectivo; }
    else if (metodoPago === 'tarjeta')  { tarjeta  = parseFloat(pagoCliente); montoPagado = tarjeta; }
    else { efectivo = parseFloat(montoEfectivo || 0); tarjeta = parseFloat(montoTarjeta || 0); montoPagado = efectivo + tarjeta; }

    if (isNaN(montoPagado) || montoPagado < total) { alert('El pago es insuficiente'); return; }

    try {
      const res = await fetch(`${API_URL}/api/ventas/nueva`, {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({
          total,
          metodoPago,
          pagoTarjeta: tarjeta,
          montoPagado,
          cambio: montoPagado - total,
          productos: carrito.map(i => ({ id: i.id, cantidad: i.cantidad, precio: i.precio })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setVentaFinalizada({ ...data, productos: carrito, pagoEfectivo: efectivo, pagoTarjeta: tarjeta, descuento: calcularDescuento(), subtotal });
        setCarrito([]); setPagoCliente(''); setMontoEfectivo(''); setMontoTarjeta('');
        setDescuentoValor(''); setMetodoPago('efectivo');
        obtenerProductos();
      } else {
        alert(data.error || 'Error al registrar la venta');
      }
    } catch (e) { alert('No se pudo conectar con el servidor'); }
  };

  const handlePrint = () => {
    if (!ticketRef.current) return;
    const win = window.open('', 'PRINT', 'height=600,width=320');
    win.document.write(`<html><head><title>Ticket</title>
      <style>body{font-family:monospace;width:280px;padding:10px;font-size:12px;}
      hr{border-top:1px dashed #000;}h3,p{text-align:center;margin:3px 0;}
      .l{text-align:left;}</style></head><body>`);
    win.document.write(ticketRef.current.innerHTML);
    win.document.write('</body></html>');
    win.document.close(); win.print(); win.close();
  };

  /* ── Filtered list ─────────────────────────────────────────── */
  const productosFiltrados = (busqueda || filtroCategoria)
    ? productos.filter(p => {
        const matchQ   = !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (p.codigoBarras || '').toLowerCase().includes(busqueda.toLowerCase());
        const matchCat = !filtroCategoria || String(p.categoriaId) === filtroCategoria;
        return matchQ && matchCat;
      })
    : [];

  const cambio = calcularCambio();
  const descuentoAplicado = calcularDescuento();
  const tienda = JSON.parse(localStorage.getItem('tienda_config') || '{}');

  if (cargandoCaja) return <p style={{ padding: '20px' }}>Verificando caja…</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Punto de Venta</h1>
        {!cajaAbierta && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius)', padding: '12px 16px', marginTop: '12px', color: '#991b1b', fontWeight: 600 }}>
            ⚠️ No hay caja abierta. Las ventas están bloqueadas hasta que un gerente inicie la caja.
          </div>
        )}
        {cajaAbierta && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius)', padding: '10px 16px', marginTop: '12px', color: '#166534', fontSize: '.85rem' }}>
            ✓ Caja abierta — Total en caja: <strong>${parseFloat(cajaAbierta.totalEnCaja).toFixed(2)}</strong>
          </div>
        )}
      </div>

      <div className="ventas-layout">
        {/* Left panel */}
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div className="search-wrapper" style={{ flex: 1 }}>
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar o escanear código de barras…"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
              <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
                style={{ width: 'auto', minWidth: '140px' }}>
                <option value="">Todas las categorías</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            {busqueda && (
              <p style={{ fontSize: '.72rem', color: 'var(--color-muted)', marginTop: '6px' }}>
                Presiona <kbd style={{ background: '#f1f5f9', border: '1px solid var(--color-border)', borderRadius: '3px', padding: '1px 5px', fontSize: '.7rem' }}>Enter</kbd> para agregar si hay coincidencia exacta de código de barras
              </p>
            )}
          </div>

          {productosFiltrados.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '16px' }}>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, maxHeight: '320px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Código</th>
                      <th style={{ textAlign: 'right' }}>Precio</th>
                      <th style={{ textAlign: 'center' }}>Stock</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {p.imagenUrl && <img src={`${API_URL}${p.imagenUrl}`} alt={p.nombre} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />}
                            <strong style={{ fontSize: '.875rem' }}>{p.nombre}</strong>
                          </div>
                        </td>
                        <td><span style={{ fontFamily: 'monospace', fontSize: '.8rem', color: 'var(--color-muted)' }}>{p.codigoBarras || '—'}</span></td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>${parseFloat(p.precio).toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${p.stock <= (p.stockMinimo || 0) ? 'badge-danger' : 'badge-success'}`}>{p.stock}</span>
                        </td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => agregarAlCarrito(p)} disabled={!cajaAbierta || p.stock === 0}>
                            <FaPlus />
                            {carrito.find(c => c.id === p.id)?.cantidad > 0 && (
                              <span style={{ opacity: .75 }}>({carrito.find(c => c.id === p.id).cantidad})</span>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ticket */}
          {ventaFinalizada && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 className="card-title" style={{ marginBottom: 0 }}>Ticket de venta</h2>
                <button className="btn btn-ghost btn-sm" onClick={handlePrint}><FaPrint /> Imprimir</button>
              </div>
              <div ref={ticketRef} style={{ fontFamily: 'monospace', fontSize: '12px', width: '260px', margin: '0 auto' }}>
                {tienda.nombre    && <h3>{tienda.nombre}</h3>}
                {tienda.direccion && <p>{tienda.direccion}</p>}
                {tienda.ciudad    && <p>{tienda.ciudad}</p>}
                {tienda.telefono  && <p>Tel: {tienda.telefono}</p>}
                {tienda.rfc       && <p>RFC: {tienda.rfc}</p>}
                <hr />
                <p>Fecha: {new Date().toLocaleString('es-MX')}</p>
                <p>Cajero: {usuarioNombre}</p>
                <hr />
                {ventaFinalizada.productos.map((item, i) => (
                  <div key={i}>
                    <p className="l">{item.nombre}</p>
                    <p className="l">&nbsp;{item.cantidad} × ${parseFloat(item.precio).toFixed(2)} = ${(item.cantidad * item.precio).toFixed(2)}</p>
                  </div>
                ))}
                <hr />
                <p className="l">Subtotal: ${ventaFinalizada.subtotal.toFixed(2)}</p>
                {ventaFinalizada.descuento > 0 && (
                  <p className="l">Descuento: -${ventaFinalizada.descuento.toFixed(2)}</p>
                )}
                <p className="l"><strong>Total: ${parseFloat(ventaFinalizada.total).toFixed(2)}</strong></p>
                <p className="l">Método: {ventaFinalizada.metodoPago}</p>
                {ventaFinalizada.metodoPago === 'mixto' && (<>
                  <p className="l">Efectivo: ${ventaFinalizada.pagoEfectivo.toFixed(2)}</p>
                  <p className="l">Tarjeta: ${ventaFinalizada.pagoTarjeta.toFixed(2)}</p>
                </>)}
                <p className="l">Cambio: ${parseFloat(ventaFinalizada.cambio).toFixed(2)}</p>
                <hr />
                <p>¡Gracias por su compra!</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: cart */}
        <div className="carrito-panel">
          <h2 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
            <FaShoppingCart /> Carrito
            {carrito.length > 0 && <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>{carrito.length}</span>}
          </h2>

          {carrito.length === 0
            ? <p style={{ color: 'var(--color-muted)', fontSize: '.85rem', textAlign: 'center', padding: '24px 0' }}>Carrito vacío</p>
            : (
              <div>
                {carrito.map((item, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, fontSize: '.875rem', flex: 1, marginRight: '6px' }}>{item.nombre}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <strong style={{ minWidth: '58px', textAlign: 'right', fontSize: '.875rem' }}>${(item.precio * item.cantidad).toFixed(2)}</strong>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setCarrito(prev => prev.filter((_, idx) => idx !== i))}><FaTrash /></button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => cambiarCantidad(i, -1)}><FaMinus /></button>
                      <span style={{ fontSize: '.875rem', fontWeight: 700, minWidth: '22px', textAlign: 'center' }}>{item.cantidad}</span>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => cambiarCantidad(i, 1)}><FaPlus /></button>
                      <span style={{ fontSize: '.75rem', color: 'var(--color-muted)' }}>× ${parseFloat(item.precio).toFixed(2)}</span>
                    </div>
                  </div>
                ))}

                {/* Discount */}
                <div style={{ marginTop: '14px', padding: '10px 12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '.78rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    <FaTag /> Descuento
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select value={descuentoTipo} onChange={e => setDescuentoTipo(e.target.value)}
                      style={{ width: 'auto', minWidth: '70px', fontSize: '.8rem', padding: '5px 8px' }}>
                      <option value="porcentaje">%</option>
                      <option value="fijo">$</option>
                    </select>
                    <input type="number" min="0" step="0.01"
                      placeholder={descuentoTipo === 'porcentaje' ? '0 %' : '0.00'}
                      value={descuentoValor} onChange={e => setDescuentoValor(e.target.value)}
                      style={{ fontSize: '.85rem' }} />
                  </div>
                </div>

                {/* Totals */}
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '2px solid var(--color-border)' }}>
                  {descuentoAplicado > 0 && (<>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', color: 'var(--color-muted)', marginBottom: '4px' }}>
                      <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', color: 'var(--color-success)', fontWeight: 600, marginBottom: '4px' }}>
                      <span>Descuento</span><span>−${descuentoAplicado.toFixed(2)}</span>
                    </div>
                  </>)}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700 }}>
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment */}
                <div style={{ marginTop: '14px' }}>
                  <div className="form-group">
                    <label>Método de pago</label>
                    <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="mixto">Mixto</option>
                    </select>
                  </div>

                  {(metodoPago === 'efectivo' || metodoPago === 'tarjeta') && (
                    <div className="form-group">
                      <label>Monto recibido</label>
                      <input type="number" min="0" step="0.01" placeholder="$0.00"
                        value={pagoCliente} onChange={e => setPagoCliente(e.target.value)} />
                    </div>
                  )}

                  {metodoPago === 'mixto' && (<>
                    <div className="form-group">
                      <label>Efectivo</label>
                      <input type="number" min="0" step="0.01" placeholder="$0.00"
                        value={montoEfectivo} onChange={e => setMontoEfectivo(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Tarjeta</label>
                      <input type="number" min="0" step="0.01" placeholder="$0.00"
                        value={montoTarjeta} onChange={e => setMontoTarjeta(e.target.value)} />
                    </div>
                  </>)}

                  {((cambio >= 0 && pagoCliente) || (metodoPago === 'mixto' && (montoEfectivo || montoTarjeta))) && (
                    <div style={{ background: 'var(--color-primary-light)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }}>Cambio</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>${Math.max(0, cambio).toFixed(2)}</span>
                    </div>
                  )}

                  <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                    onClick={finalizarVenta} disabled={!cajaAbierta}>
                    Finalizar Venta
                  </button>
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

export default Ventas;
