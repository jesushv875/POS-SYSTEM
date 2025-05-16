import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

function Salidas() {
  const [productos, setProductos] = useState([]);
  const [salidas, setSalidas] = useState([]);
  const [formData, setFormData] = useState({
    productoId: '',
    motivo: '',
    cantidad: '',
    comentario: '',
    imagen: null,
  });
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsuarioId(decoded.id);
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }

    fetch('http://localhost:5001/api/productos')
      .then((res) => res.json())
      .then((data) => setProductos(data));

    fetchSalidas();
  }, []);

  const fetchSalidas = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/inventario/salidas', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error HTTP: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      setSalidas(data);
    } catch (error) {
      console.error('Error al obtener salidas:', error);
      alert('Error al cargar historial de salidas');
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('productoId', formData.productoId);
    data.append('motivo', formData.motivo);
    data.append('cantidad', formData.cantidad);
    data.append('comentario', formData.comentario);
    data.append('imagen', formData.imagen);
    data.append('usuarioId', usuarioId);

    try {
      const res = await fetch('http://localhost:5001/api/inventario/salida', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        alert('Salida registrada correctamente');
        setFormData({ productoId: '', motivo: '', cantidad: '', comentario: '', imagen: null });
        fetchSalidas();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error al registrar salida:', error);
      alert('Error al registrar salida');
    }
  };

  return (
    <div className="container">
      <button onClick={() => window.location.href = '/inventario'} style={{ marginBottom: '20px' }}>
        Regresar a Inventario
      </button>
      <h1>Registrar Salida de Producto</h1>
      <form onSubmit={handleSubmit}>
        <label>Producto</label>
        <select name="productoId" value={formData.productoId} onChange={handleChange} required>
          <option value="">Selecciona un producto</option>
          {productos.map((prod) => (
            <option key={prod.id} value={prod.id}>{prod.nombre}</option>
          ))}
        </select>

        <label>Motivo</label>
        <input type="text" name="motivo" value={formData.motivo} onChange={handleChange} required />

        <label>Cantidad</label>
        <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} required />

        <label>Comentario</label>
        <input type="text" name="comentario" value={formData.comentario} onChange={handleChange} />

        <label>Imagen (Foto, documento, etc.)</label>
        <input type="file" name="imagen" onChange={handleChange} accept="image/*,.pdf" />

        <button type="submit">Registrar Salida</button>
      </form>

      <h2>Historial de Salidas</h2>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Motivo</th>
            <th>Cantidad</th>
            <th>Comentario</th>
            <th>Archivo</th>
          </tr>
        </thead>
        <tbody>
          {salidas.map((salida) => {
            const productoNombre = productos.find((p) => p.id === salida.productoId)?.nombre || 'Producto no encontrado';
            return (
              <tr key={salida.id}>
                <td>{new Date(salida.fecha).toLocaleString()}</td>
                <td>{productoNombre}</td>
                <td>{salida.motivo}</td>
                <td>{salida.cantidad}</td>
                <td>{salida.comentario || '-'}</td>
                <td>
                  {salida.imagenUrl ? (
                    salida.imagenUrl.toLowerCase().endsWith('.pdf') ? (
                      <a href={`http://localhost:5001${salida.imagenUrl}`} target="_blank" rel="noopener noreferrer" download>
                        Descargar PDF
                      </a>
                    ) : (
                      <a href={`http://localhost:5001${salida.imagenUrl}`} target="_blank" rel="noopener noreferrer">
                        Ver Imagen
                      </a>
                    )
                  ) : (
                    'Sin archivo'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Salidas;