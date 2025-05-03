import React, { useEffect, useState } from 'react';

function Caja() {
  const [caja, setCaja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p>Cargando caja...</p>;
  if (error) return <p>Error: {error}</p>;

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
    onChange={handleFondoChange}
  />
  <button onClick={actualizarFondo}>Actualizar Fondo</button>
</div>
    </div>
  );
}

export default Caja;