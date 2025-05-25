import React, { useEffect, useState } from 'react';

function Caja() {
  const [caja, setCaja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [corte, setCorte] = useState(null);
  const [nuevoFondo, setNuevoFondo] = useState('');

  const obtenerCorte = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/caja/corte');
      if (!res.ok) throw new Error('Error al obtener corte de caja');
      const data = await res.json();
      setCorte(data);
    } catch (error) {
      console.error(error);
      alert('Error al obtener corte de caja');
    }
  };

  const imprimirCorte = () => {
    const printContent = document.getElementById('corte-caja').innerHTML;
    const win = window.open('', '', 'width=300,height=600');
    win.document.write(`
      <html>
      <head>
        <style>
          body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; }
          .titulo { text-align: center; font-weight: bold; margin-bottom: 10px; }
          .linea { border-top: 1px dashed #000; margin: 5px 0; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `);
    win.document.close();
    win.print();
    win.close();
  };
  const cerrarCaja = async () => {
    if (!window.confirm('¿Seguro que deseas cerrar la caja? Esto retirará todo el dinero.')) return;
    try {
      const res = await fetch('http://localhost:5001/api/caja/cerrar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
  
      const data = await res.json();
      if (res.ok) {
        alert('Caja cerrada correctamente');
        window.location.reload();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error al cerrar caja');
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchCaja = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/caja/hoy');
        if (!res.ok) throw new Error('Error al obtener la caja');
        const data = await res.json();
        setCaja(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCaja();
  }, []);

  const handleFondoChange = (e) => {
    setCaja({ ...caja, fondoInicial: Number(e.target.value) });
  };

  const actualizarFondo = async () => {
    if (!caja.fondoInicial || caja.fondoInicial <= 0) {
      alert('Ingrese un fondo inicial válido mayor a 0');
      return;
    }
    try {
      const res = await fetch('http://localhost:5001/api/caja/fondo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fondoInicial: caja.fondoInicial })
      });
      const updatedCaja = await res.json();
      setCaja(updatedCaja);
      alert('Fondo actualizado');
    } catch (err) {
      alert('Error al actualizar fondo');
      console.error(err);
    }
  };

  const iniciarCaja = async () => {
    const fondo = parseFloat(nuevoFondo);
    if (isNaN(fondo) || fondo <= 0) {
      alert('Ingrese un fondo válido mayor a 0');
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/caja/iniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fondoInicial: fondo })
      });

      const nuevaCaja = await res.json();
      setCaja(nuevaCaja);
      setNuevoFondo('');
      alert('Caja iniciada correctamente');
    } catch (err) {
      console.error(err);
      alert('Error al iniciar caja');
    }
  };

  if (loading) return <p>Cargando caja...</p>;
  if (error) return <p>Error: {error}</p>;

  if (!caja) {
    return (
      <div className="container">
        <h1>Iniciar Caja</h1>
        <label>Fondo Inicial: </label>
        <input
          type="number"
          value={nuevoFondo}
          onChange={(e) => setNuevoFondo(e.target.value)}
          min="0"
          step="0.01"
        />
        <button onClick={iniciarCaja}>Iniciar Caja</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Caja del Día</h1>
      <p><strong>Fecha:</strong> {new Date(caja.fecha).toLocaleString()}</p>
      <p><strong>Total en Caja:</strong> ${parseFloat(caja.totalEnCaja).toFixed(2)}</p>
      <p><strong>Fondo Inicial:</strong> ${Number(caja?.fondoInicial || 0).toFixed(2)}</p>
      <div>
        <label>Fondo caja: </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={caja.fondoInicial}
          onChange={handleFondoChange}
        />
        <button onClick={actualizarFondo}>Actualizar Fondo</button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <button onClick={obtenerCorte}>Generar Corte de Caja</button>
        <button style={{ marginLeft: '10px' }} onClick={cerrarCaja}>
  Cerrar Caja
</button>
        {corte && typeof corte === 'object' && (
          <>
            <div id="corte-caja" style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
              <div className="titulo">CORTE DE CAJA</div>
              <div className="linea"></div>
              Fecha: {corte.fecha ? new Date(corte.fecha).toLocaleString() : 'Sin fecha'}
              <br />Fondo Inicial: ${Number(corte.fondoInicial ?? 0).toFixed(2)}
              <br />Total Ventas: ${Number(corte.totalVentas ?? 0).toFixed(2)}
              <br />Efectivo: ${Number(corte.efectivo ?? 0).toFixed(2)}
              <br />Tarjeta: ${Number(corte.tarjeta ?? 0).toFixed(2)}
              {/* Ingresos y egresos removidos */}
              <br /><strong>Total en Caja: ${Number(corte.totalEnCaja ?? 0).toFixed(2)}</strong>
              <div className="linea"></div>
            </div>
            <button onClick={imprimirCorte}>Imprimir Corte</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Caja;