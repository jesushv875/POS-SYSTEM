// src/pages/Reportes.js
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Reportes = () => {
  const [tipoReporte, setTipoReporte] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [resultados, setResultados] = useState([]);
  const [orden, setOrden] = useState('');
  const [graficaVentas, setGraficaVentas] = useState([]);

  const manejarCambio = (e) => {
    setTipoReporte(e.target.value);
    setResultados([]);
  };

  const ordenarResultados = (criterio) => {
    const copia = [...resultados];
    if (tipoReporte === 'inventario-bajo') {
      if (criterio === 'nombre') {
        copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
      } else if (criterio === 'stock') {
        copia.sort((a, b) => b.stock - a.stock);
      } else if (criterio === 'id') {
        copia.sort((a, b) => a.id - b.id);
      }
    } else {
      if (criterio === 'nombre') {
        copia.sort((a, b) => (a.producto?.nombre || '').localeCompare(b.producto?.nombre || ''));
      } else if (criterio === 'cantidad') {
        copia.sort((a, b) => (b._sum?.cantidad ?? 0) - (a._sum?.cantidad ?? 0));
      } else if (criterio === 'subtotal') {
        copia.sort((a, b) => (b._sum?.subtotal ?? 0) - (a._sum?.subtotal ?? 0));
      } else if (criterio === 'id') {
        copia.sort((a, b) => (a.producto?.id ?? a.productoId) - (b.producto?.id ?? b.productoId));
      }
      setOrden(criterio);
    }
    setResultados(copia);
  };

  const exportarCSV = () => {
    const encabezados = ['Producto', 'Cantidad Vendida', 'Total Vendido'];
    const filas = resultados.map((item) => [
      item.producto?.nombre || `ID ${item.productoId}`,
      item._sum?.cantidad ?? 0,
      Number(item._sum?.subtotal ?? 0).toFixed(2)
    ]);
    const csv = [encabezados, ...filas].map(f => f.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_ventas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarCSVInventarioBajo = () => {
    const encabezados = ['ID', 'Producto', 'Stock', 'Stock Mínimo'];
    const filas = resultados.map((item) => [
      item.id,
      item.nombre,
      item.stock,
      item.stockMinimo
    ]);
    const csv = [encabezados, ...filas].map(f => f.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'inventario_bajo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let url = '';
    // Para ventas-producto requiere fechas, para inventario-bajo no.
    if (tipoReporte === 'ventas-producto') {
      if (!desde || !hasta) return alert("Selecciona un rango de fechas válido");
      url = `http://localhost:5001/api/reportes/ventas-producto?desde=${desde}&hasta=${hasta}`;
    } else if (tipoReporte === 'inventario-bajo') {
      url = `http://localhost:5001/api/reportes/inventario-bajo`;
    } else {
      return;
    }
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (tipoReporte === 'inventario-bajo') {
        // Validar que data sea un array con objetos que tengan las propiedades esperadas
        if (
          !Array.isArray(data) ||
          data.some(item =>
            typeof item.nombre !== 'string' ||
            typeof item.stock !== 'number' ||
            typeof item.stockMinimo !== 'number'
          )
        ) {
          console.error("Formato de datos de inventario-bajo no es el esperado.");
          setResultados([]);
          return;
        }
      }
      setResultados(data);
    } catch (err) {
      console.error("Error al obtener reporte:", err);
    }
  };

  useEffect(() => {
    if (tipoReporte === 'inventario-bajo') {
      handleSubmit(new Event('submit'));
    }
  }, [tipoReporte]);

  useEffect(() => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const desde = `${year}-01-01`;
    const hasta = `${year}-${String(hoy.getMonth() + 1).padStart(2, '0')}-31`;

    fetch(`http://localhost:5001/api/reportes/ventas-mensuales?desde=${desde}&hasta=${hasta}`)
      .then(res => res.json())
      .then(data => setGraficaVentas(data))
      .catch(err => console.error('Error al cargar gráfica:', err));
  }, []);

  return (
    <div className="container">
      <h1>Reportes</h1>
      <div className="mb-3">
        <label htmlFor="tipoReporte">Selecciona un tipo de reporte:</label>
        <select
          id="tipoReporte"
          className="form-control"
          value={tipoReporte}
          onChange={manejarCambio}
        >
          <option value="">-- Selecciona --</option>
          <option value="ventas-producto">Ventas por producto</option>
          <option value="inventario-bajo">Inventario bajo</option>
        </select>
      </div>

      {graficaVentas.length > 0 && tipoReporte === '' && (
        <div style={{ maxWidth: '600px', margin: '0 auto 40px' }}>
          <h4>Ventas Generales por Mes</h4>
          <Bar
            data={{
              labels: graficaVentas.map(item => item.mes),
              datasets: [{
                label: 'Total de Ventas',
                data: graficaVentas.map(item => item.total),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
              }],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Ventas Mensuales' }
              }
            }}
          />
        </div>
      )}
      

      {tipoReporte === 'ventas-producto' && (
        <div style={{ marginTop: '20px' }}>
          <h4>Ventas por Producto</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Desde:</label>
              <input
                type="date"
                className="form-control"
                name="desde"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Hasta:</label>
              <input
                type="date"
                className="form-control"
                name="hasta"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary mt-2">Generar Reporte</button>
          </form>

          {resultados.length > 0 && (
            <div className="mt-4">
              <h5>Resultados:</h5>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <button className="btn btn-success" onClick={exportarCSV}>Exportar CSV</button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th onClick={() => ordenarResultados('id')}>ID</th>
                    <th onClick={() => ordenarResultados('nombre')}>Producto</th>
                    <th onClick={() => ordenarResultados('cantidad')}>Cantidad Vendida</th>
                    <th onClick={() => ordenarResultados('subtotal')}>Total Vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((item, index) => (
                    <tr key={index}>
                      <td>{item.producto?.id || item.productoId}</td>
                      <td>{item.producto?.nombre || `ID ${item.productoId}`}</td>
                      <td>{item._sum?.cantidad ?? 0}</td>
                      <td>${Number(item._sum?.subtotal ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tipoReporte === 'inventario-bajo' && (
        <div className="mt-4">
          <h5>Productos con Inventario Bajo</h5>
          <div className="mb-2">
            <button className="btn btn-success" onClick={exportarCSVInventarioBajo}>Exportar CSV</button>
          </div>
          <table className="table table-bordered table-hover table-striped">
            <thead>
              <tr>
                <th onClick={() => ordenarResultados('id')}>ID</th>
                <th onClick={() => ordenarResultados('nombre')}>Producto</th>
                <th onClick={() => ordenarResultados('stock')}>Stock</th>
                <th>Stock Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((prod, index) => (
                <tr key={index} className={prod.stock <= prod.stockMinimo ? 'table-danger' : ''}>
                  <td>{prod.id}</td>
                  <td>{prod.nombre}</td>
                  <td>{prod.stock}</td>
                  <td>{prod.stockMinimo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tipoReporte !== 'ventas-producto' && tipoReporte !== 'inventario-bajo' && tipoReporte !== '' && (
        <div style={{ marginTop: '20px' }}>
          <p>Reporte seleccionado: <strong>{tipoReporte}</strong></p>
        </div>
      )}
    </div>
  );
};

export default Reportes;