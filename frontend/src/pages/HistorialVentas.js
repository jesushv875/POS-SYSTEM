import React, { useEffect, useState, useRef } from 'react';
import { FaSearch, FaChevronDown, FaChevronUp, FaPrint, FaFilter, FaTimes } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

function HistorialVentas() {
  const [ventas, setVentas]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [busqueda, setBusqueda]     = useState('');
  const [desde, setDesde]           = useState('');
  const [hasta, setHasta]           = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_URL}/api/ventas`, { headers: authHeader() });
        if (res.ok) setVentas(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const limpiarFiltros = () => { setBusqueda(''); setDesde(''); setHasta(''); };

  const ventasFiltradas = ventas.filter(v => {
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const match = String(v.id).includes(q) ||
        (v.usuario?.nombre || '').toLowerCase().includes(q) ||
        (v.metodoPago || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (desde) {
      const d = new Date(desde); d.setHours(0,0,0,0);
      if (new Date(v.fecha) < d) return false;
    }
    if (hasta) {
      const h = new Date(hasta); h.setHours(23,59,59,999);
      if (new Date(v.fecha) > h) return false;
    }
    return true;
  });

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  /* ── Reprint ticket ────────────────────────────────────────── */
  const imprimirTicket = (venta) => {
    const tienda = JSON.parse(localStorage.getItem('tienda_config') || '{}');
    const win = window.open('', 'PRINT', 'height=600,width=320');
    const lineas = (venta.detalles || []).map(d => {
      const nombre = d.producto?.nombre || `Producto #${d.productoId}`;
      const precio = (parseFloat(d.subtotal) / d.cantidad).toFixed(2);
      const subt   = parseFloat(d.subtotal).toFixed(2);
      return `<p class="l">${nombre}</p><p class="l">&nbsp;${d.cantidad} × $${precio} = $${subt}</p>`;
    }).join('');

    win.document.write(`
      <html><head><title>Ticket #${venta.id}</title>
      <style>
        body { font-family: monospace; width: 280px; padding: 10px; font-size: 12px; }
        hr   { border-top: 1px dashed #000; margin: 4px 0; }
        h3,p { text-align: center; margin: 3px 0; }
        .l   { text-align: left; }
      </style></head><body>
      ${tienda.nombre    ? `<h3>${tienda.nombre}</h3>` : ''}
      ${tienda.direccion ? `<p>${tienda.direccion}</p>` : ''}
      ${tienda.ciudad    ? `<p>${tienda.ciudad}</p>`    : ''}
      ${tienda.telefono  ? `<p>Tel: ${tienda.telefono}</p>` : ''}
      ${tienda.rfc       ? `<p>RFC: ${tienda.rfc}</p>`      : ''}
      <hr/>
      <p>Folio: #${venta.id}</p>
      <p>Fecha: ${new Date(venta.fecha).toLocaleString('es-MX')}</p>
      <p>Cajero: ${venta.usuario?.nombre || '—'}</p>
      <hr/>
      ${lineas}
      <hr/>
      <p class="l"><strong>Total: $${parseFloat(venta.total).toFixed(2)}</strong></p>
      <p class="l">Método: ${venta.metodoPago || 'efectivo'}</p>
      <p class="l">Cambio: $${parseFloat(venta.cambio || 0).toFixed(2)}</p>
      <hr/>
      <p>¡Gracias por su compra!</p>
      <p style="font-size:10px;color:#999">— REIMPRESIÓN —</p>
      </body></html>
    `);
    win.document.close();
    win.print();
    win.close();
  };

  const hayFiltros = busqueda || desde || hasta;

  if (loading) return <p style={{ padding: '20px' }}>Cargando historial…</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Historial de Ventas</h1>
        <p>{ventasFiltradas.length} de {ventas.length} ventas</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="search-wrapper" style={{ flex: 1, minWidth: '200px' }}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por #folio, cajero o método…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '140px' }}>
            <label style={{ fontSize: '.72rem' }}>Desde</label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '140px' }}>
            <label style={{ fontSize: '.72rem' }}>Hasta</label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
          </div>
          {hayFiltros && (
            <button className="btn btn-ghost btn-sm" onClick={limpiarFiltros} title="Limpiar filtros">
              <FaTimes /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {ventasFiltradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FaFilter /></div>
            <p>{hayFiltros ? 'Sin ventas para los filtros aplicados.' : 'No hay ventas registradas.'}</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Cajero</th>
                  <th>Método</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'right' }}>Cambio</th>
                  <th style={{ textAlign: 'center' }}>Ticket</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.map(v => (
                  <React.Fragment key={v.id}>
                    <tr>
                      <td style={{ color: 'var(--color-muted)', fontSize: '.82rem' }}>#{v.id}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(v.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td>{v.usuario?.nombre || '—'}</td>
                      <td>
                        <span className={`badge ${v.metodoPago === 'efectivo' ? 'badge-success' : v.metodoPago === 'tarjeta' ? 'badge-info' : 'badge-warning'}`}>
                          {v.metodoPago || 'efectivo'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>${parseFloat(v.total).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--color-muted)' }}>${parseFloat(v.cambio || 0).toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={(e) => { e.stopPropagation(); imprimirTicket(v); }}
                          title="Reimprimir ticket"
                        >
                          <FaPrint />
                        </button>
                      </td>
                      <td style={{ cursor: 'pointer' }} onClick={() => toggleExpand(v.id)}>
                        {expandedId === v.id ? <FaChevronUp style={{ color: 'var(--color-muted)' }} /> : <FaChevronDown style={{ color: 'var(--color-muted)' }} />}
                      </td>
                    </tr>

                    {expandedId === v.id && (
                      <tr>
                        <td colSpan="8" style={{ padding: 0 }}>
                          <div style={{ background: 'var(--color-bg)', padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                Detalle de venta #{v.id}
                              </span>
                              <button className="btn btn-ghost btn-sm" onClick={() => imprimirTicket(v)}>
                                <FaPrint /> Reimprimir ticket
                              </button>
                            </div>
                            {v.detalles && v.detalles.length > 0 ? (
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
                                <thead>
                                  <tr>
                                    {['Producto','Cant.','Precio unitario','Subtotal'].map(h => (
                                      <th key={h} style={{ textAlign: h === 'Producto' ? 'left' : 'right', padding: '5px 10px', color: 'var(--color-muted)', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {v.detalles.map((d, i) => (
                                    <tr key={i}>
                                      <td style={{ padding: '6px 10px' }}>{d.producto?.nombre || `#${d.productoId}`}</td>
                                      <td style={{ textAlign: 'right', padding: '6px 10px' }}>{d.cantidad}</td>
                                      <td style={{ textAlign: 'right', padding: '6px 10px' }}>
                                        ${(parseFloat(d.subtotal) / d.cantidad).toFixed(2)}
                                      </td>
                                      <td style={{ textAlign: 'right', padding: '6px 10px', fontWeight: 600 }}>
                                        ${parseFloat(d.subtotal).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p style={{ color: 'var(--color-muted)', fontSize: '.85rem' }}>Sin detalle disponible.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div ref={printRef} />
    </div>
  );
}

export default HistorialVentas;
