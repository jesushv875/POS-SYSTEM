import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

function Salidas() {
  const [productos, setProductos] = useState([]);
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
  }, []);

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
    data.append('usuarioId', usuarioId); // 👈 aseguramos que el usuarioId va en el body

    try {
      const res = await fetch('http://localhost:5001/api/inventario/salida', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // opcional si quieres validar
        },
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        alert('Salida registrada correctamente');
        setFormData({ productoId: '', motivo: '', cantidad: '', comentario: '', imagen: null });
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert('Error al registrar salida');
    }
  };

  return (
    <div className="container">
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

        <label>Imagen (Factura, foto, etc.)</label>
        <input type="file" name="imagen" onChange={handleChange} accept="image/*" />

        <button type="submit">Registrar Salida</button>
      </form>
    </div>
  );
}

export default Salidas;