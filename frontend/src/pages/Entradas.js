import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';


function Entradas() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [entradas, setEntradas] = useState([]);
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

    fetchEntradas();
  }, []);

  const fetchEntradas = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/inventario/entradas', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error HTTP: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      setEntradas(data);
    } catch (error) {
      console.error('Error al obtener entradas:', error);
      alert('Error al cargar historial de entradas');
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
  
    // ✅ Confirmación previa de usuarioId en consola
    console.log('Usuario ID que se enviará con la entrada:', usuarioId);
  
    if (!usuarioId) {
      alert('Error: No se detectó usuarioId. Verifica sesión.');
      return;
    }
  
    try {
      const res = await fetch('http://localhost:5001/api/inventario/entrada', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });
  
      const result = await res.json();
      if (res.ok) {
        alert('Entrada registrada correctamente');
        setFormData({ productoId: '', motivo: '', cantidad: '', comentario: '', imagen: null });
        fetchEntradas();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      alert('Error al registrar entrada');
    }
  };

  return (
    <div className="container">
            <button onClick={() => navigate('/inventario')} style={{ marginBottom: '15px' }}>
        Volver a Inventario
      </button>

      <h1>Registrar Entrada de Producto</h1>
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

        <label>Imagen (Factura, foto, etc.)</label>
        <input type="file" name="imagen" onChange={handleChange} accept="image/*,.pdf" />

        <button type="submit">Registrar Entrada</button>
      </form>

      <h2>Historial de Entradas</h2>
<table>
  <thead>
    <tr>
      <th>Fecha</th>
      <th>Producto</th>
      <th>Motivo</th>
      <th>Cantidad</th>
      <th>Comentario</th>
      <th>Imagen</th>
    </tr>
  </thead>
  <tbody>
    {entradas.map((entrada) => {
      const productoNombre = productos.find((p) => p.id === entrada.productoId)?.nombre || 'Producto no encontrado';
      return (
        <tr key={entrada.id}>
          <td>{new Date(entrada.fecha).toLocaleString()}</td>
          <td>{productoNombre}</td>
          <td>{entrada.motivo}</td>
          <td>{entrada.cantidad}</td>
          <td>{entrada.comentario || '-'}</td>
          <td>
            {entrada.imagenUrl ? (
              entrada.imagenUrl.toLowerCase().endsWith('.pdf') ? (
                <a href={`http://localhost:5001${entrada.imagenUrl}`} target="_blank" rel="noopener noreferrer" download>
                  Descargar PDF
                </a>
              ) : (
                <a href={`http://localhost:5001${entrada.imagenUrl}`} target="_blank" rel="noopener noreferrer">
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

export default Entradas;