import React, { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { FaChartBar, FaBoxOpen, FaDownload, FaSearch } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = process.env.REACT_APP_API_URL;

const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

function Reportes() {
  const [tipo, setTipo]             = useState('grafica');
  const [desde, setDesde]           = useState('');
  const [hasta, setHasta]           = useState('');
  const [resultados, setResultados] = useState([]);
  const [graficaVentas, setGrafica] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [ordenCampo, setOrdenCampo] = useState('');
  const [ordenDir, setOrdenDir]     = useState('asc');

  // Monthly chart on mount
  useEffect(() => {
    const hoy  = new Date();
    const year = hoy.getFullYear();
    fetch(`${API_URL}/api/reportes/ventas-mensuales?desde=${year}-01-01&hasta=${year}-12-31`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => setGrafica(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  const generarReporte = useCallback(async () => {
    if (tipo === 'ventas-producto' && (!desde || !hasta)) { alert('Selecciona un rango de fechas'); return; }
    setLoading(true);
    try {
      const url = tipo === 'ventas-producto'
        ? `${API_URL}/api/reportes/ventas-producto?desde=${desde}&hasta=${hasta}`
        : `${API_URL}/api/reportes/inventario-bajo`;
      const res  = await fetch(url, { headers: authHeader() });
      const data = await res.json();
      setResultados(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [tipo, desde, hasta]);

  // Auto-load low-stock
  useEffect(() => {
    if (tipo === 'inventario-bajo') generarReporte();
  }, [tipo, generarReporte]);

  const toggleSort = (campo) => {
    if (ordenCampo === campo) setOrdenDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setOrdenCampo(campo); setOrdenDir('asc'); }
  };

  const sorted = [...resultados].sort((a, b) => {
    if (!ordenCampo) return 0;
    let va, vb;
    if (tipo === 'ventas-producto') {
      va = ordenCampo === 'nombre' ? (a.producto?.nombre || '') : (Number(a._sum?.[ordenCampo]) || 0);
      vb = ordenCampo === 'nombre' ? (b.producto?.nombre || '') : (Number(b._sum?.[ordenCampo]) || 0);
    } else {
      va = a[ordenCampo] ?? ''; vb = b[ordenCampo] ?? '';
    }
    if (va < vb) return ordenDir === 'asc' ? -1 : 1;
    if (va > vb) return ordenDir === 'asc' ?  1 : -1;
    return 0;
  });

  const exportCSV = () => {
    const rows = tipo === 'ventas-producto'
      ? [['Producto','Cantidad Vendida','Total Vendido'],
          ...resultados.map(i => [i.producto?.nombre || i.productoId, i._sum?.cantidad ?? 0, Number(i._sum?.subtotal ?? 0).toFixed(2)])]
      : [['ID','Producto','Stock','Stock Mínimo'],
          ...resultados.map(i => [i.id, i.nombre, i.stock, i.stockMinimo])];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `reporte_${tipo}.csv`; a.click();
  };

  const SortTh = ({ campo, children, align }) => {
    const active = ordenCampo === campo;
    return (
      <th style={{ cursor: 'pointer', textAlign: align, userSelect: 'none' }} onClick={() => toggleSort(campo)}>
        {children} <span style={{ opacity: active ? 1 : .3 }}>{active ? (ordenDir === 'asc' ? '↑' : '↓') : '↕'}</span>
      </th>
    );
  };

  const TABS = [
    { id: 'grafica',         label: 'Ventas mensuales',    icon: <FaChartBar /> },
    { id: 'ventas-producto', label: 'Ventas por producto', icon: <FaSearch /> },
    { id: 'inventario-bajo', label: 'Inventario bajo',     icon: <FaBoxOpen /> },
  ];

  const tabStyle = (id) => ({
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '10px 18px', background: 'none', border: 'none',
    borderBottom: tipo === id ? '2px solid var(--color-primary)' : '2px solid transparent',
    marginBottom: '-2px',
    color: tipo === id ? 'var(--color-primary)' : 'var(--color-muted)',
    fontWeight: tipo === id ? 700 : 500,
    cursor: 'pointer', fontSize: '.875rem', whiteSpace: 'nowrap',
    transition: 'color .15s', fontFamily: 'var(--font)',
  });

  return (
    <div>
      <div className="page-header">
        <h1>Reportes</h1>
        <p>Análisis de ventas e inventario</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '2px solid var(--color-border)', marginBottom: '24px', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} style={tabStyle(t.id)} onClick={() => { setTipo(t.id); setResultados([]); setOrdenCampo(''); }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Monthly chart */}
      {tipo === 'grafica' && (
        <div className="card" style={{ maxWidth: '720px' }}>
          <h2 className="card-title"><FaChartBar /> Ventas por mes — {new Date().getFullYear()}</h2>
          {graficaVentas.length === 0
            ? <div className="empty-state"><p>Sin datos de ventas para este año.</p></div>
            : (
              <Bar
                data={{
                  labels: graficaVentas.map(i => i.mes),
                  datasets: [{
                    label: 'Total de ventas ($)',
                    data: graficaVentas.map(i => i.total),
                    backgroundColor: 'rgba(79,70,229,.7)',
                    borderColor: 'rgba(79,70,229,1)',
                    borderWidth: 1, borderRadius: 6,
                  }],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'top' }, title: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            )
          }
        </div>
      )}

      {/* Sales by product */}
      {tipo === 'ventas-producto' && (
        <div>
          <div className="card" style={{ marginBottom: '16px', maxWidth: '480px' }}>
            <h2 className="card-title">Rango de fechas</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Desde</label>
                <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Hasta</label>
                <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={generarReporte} disabled={loading}>
              {loading ? 'Cargando…' : <><FaSearch /> Generar reporte</>}
            </button>
          </div>

          {sorted.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
                <h2 className="card-title" style={{ marginBottom: 0 }}>{sorted.length} productos</h2>
                <button className="btn btn-ghost btn-sm" onClick={exportCSV}><FaDownload /> CSV</button>
              </div>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <SortTh campo="nombre">Producto</SortTh>
                      <SortTh campo="cantidad" align="right">Cant. vendida</SortTh>
                      <SortTh campo="subtotal"  align="right">Total vendido</SortTh>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((item, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{item.producto?.nombre || `Producto #${item.productoId}`}</td>
                        <td style={{ textAlign: 'right' }}>{item._sum?.cantidad ?? 0}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>${Number(item._sum?.subtotal ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Low stock */}
      {tipo === 'inventario-bajo' && (
        loading
          ? <p style={{ color: 'var(--color-muted)', padding: '20px' }}>Cargando…</p>
          : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
                <h2 className="card-title" style={{ marginBottom: 0 }}>
                  {sorted.length} productos bajo stock mínimo
                </h2>
                {sorted.length > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={exportCSV}><FaDownload /> CSV</button>
                )}
              </div>
              {sorted.length === 0
                ? <div className="empty-state"><div className="empty-state-icon"><FaBoxOpen /></div><p>Todo el inventario está en orden. ✓</p></div>
                : (
                  <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                    <table>
                      <thead>
                        <tr>
                          <SortTh campo="nombre">Producto</SortTh>
                          <SortTh campo="stock"      align="center">Stock actual</SortTh>
                          <SortTh campo="stockMinimo" align="center">Stock mínimo</SortTh>
                          <th style={{ textAlign: 'center' }}>Faltante</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.map((prod, i) => (
                          <tr key={i} className="fila-bajo-stock">
                            <td style={{ fontWeight: 500 }}>{prod.nombre}</td>
                            <td style={{ textAlign: 'center' }}><span className="badge badge-danger">{prod.stock}</span></td>
                            <td style={{ textAlign: 'center' }}>{prod.stockMinimo}</td>
                            <td style={{ textAlign: 'center', color: 'var(--color-danger)', fontWeight: 700 }}>
                              −{prod.stockMinimo - prod.stock}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              }
            </div>
          )
      )}
    </div>
  );
}

export default Reportes;
