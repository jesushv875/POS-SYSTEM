import React, { useState, useEffect } from 'react';
import './css/App.css'; // Importa los estilos
import { jwtDecode } from 'jwt-decode';


function Inventario() {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]); // Lista filtrada
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState ([]);
  const [busqueda, setBusqueda] = useState(''); // Estado del buscador
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: '',
    stock: '',
    stockMinimo: '',
    proveedorId: '',
    codigoBarras: '',
    imagen: '',
    categoriaId: '',
    imagenUrl: '',
  });
  const [editProducto, setEditProducto] = useState(null);

 // const usuarioRol = 'admin';
     // const [isAuthenticated, setIsAuthenticated] = useState(false);
      //const [usuarioId, setUsuarioId] = useState(null); // Estado para almacenar el usuarioId
     // const token = localStorage.getItem('token');
      const [usuarioId, setUsuarioId] = useState(null);
      const [usuarioRol, setUsuarioRol] = useState(null);
    
    // Mostrar el token en la consola si está disponible
    //if (token) {
     // const decodedToken = jwtDecode(token);  // Decodificar el token
    //} else {
     // console.error('No token inventario');
    //}
    useEffect(() => {
      const token = localStorage.getItem('token');
    
      if (token) {
        const decodedToken = jwtDecode(token);
        setUsuarioId(decodedToken.id);
        setUsuarioRol(decodedToken.rol);
      } else {
        console.error('No token inventario');
      }
    }, []);
    useEffect(() => {
      if (usuarioId !== null) {
      }
    }, [usuarioId]);
    

  const fetchData = async () => {
    try {
      const productosResponse = await fetch('http://localhost:5001/api/productos');
      const proveedoresResponse = await fetch('http://localhost:5001/api/proveedores');
      const categoriasResponse = await fetch('http://localhost:5001/api/categorias'); // Asegúrate de tener este endpoint en el backend

      if (productosResponse.ok && proveedoresResponse.ok && categoriasResponse.ok) {
        const productosData = await productosResponse.json();
        setProductos(productosData);
        setProductosFiltrados(productosData); 
        setProveedores(await proveedoresResponse.json());
        setCategorias(await categoriasResponse.json()); 
      } else {
        console.error('Error al obtener datos');
      }
    } catch (error) {
      console.error('Error al conectar con la API:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función para manejar la búsqueda en tiempo real
  const handleSearch = (e) => {
    const valor = e.target.value.toLowerCase();
    setBusqueda(valor);

    if (valor === '') {
      setProductosFiltrados(productos);
    } else {
      const productosFiltrados = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(valor) ||
        producto.codigoBarras.toLowerCase().includes(valor)
      );
      setProductosFiltrados(productosFiltrados);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editProducto) {
      setEditProducto({ ...editProducto, [name]: value });
    } else {
      setNuevoProducto({ ...nuevoProducto, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Obtener token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No hay token, inicia sesión nuevamente');
        return;
      }
  
      // Decodificar token
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken.id); // Verificar qué contiene el token
  
      // Validar que el token contiene usuarioId
      if (!decodedToken || !decodedToken.id) {
        alert('Error: Token inválido, inicia sesión nuevamente');
        return;
      }
  
      const usuarioId = decodedToken.id; // Extraer el ID del usuario
  
      let response;
      let data;
  
      const productoData = editProducto || nuevoProducto;
      const producto = { 
        ...productoData, 
        usuarioId // Incluir usuarioId directamente desde decodedToken
      };
      if (usuarioId) {
        console.log("Decoded Token:", decodedToken.id); // Verificar qué contiene el token

      }
  
      if (editProducto) {
        response = await fetch(`http://localhost:5001/api/productos/${editProducto.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(producto),
        });
      } else {
        response = await fetch('http://localhost:5001/api/productos/agregar', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(producto),
        });
      }
  
      data = await response.json();
  
      if (response.ok) {
        alert(editProducto ? 'Producto actualizado correctamente' : 'Producto agregado correctamente');
        fetchData();
        setEditProducto(null);
        setNuevoProducto({ nombre: '', precio: '', stock: '', proveedorId: '', categoriaId: '', codigoBarras: '', imagenUrl: '', stockMinimo: ''});
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error al procesar producto:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
  
    try {
      // Obtener el token del localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No estás autenticado");
        return;
      }
  
      // Decodificar el token para obtener el usuarioId
      const decodedToken = jwtDecode(token);
      const usuarioId = decodedToken.id; // Asegúrate de que el token tenga el campo 'id'
      console.log("Usuario ID obtenido del token:", usuarioId); // Verificar qué contiene el token
  
      // Enviar la solicitud DELETE e incluir el usuarioId en el body
      const response = await fetch(`http://localhost:5001/api/productos/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Asegurar autenticación
        },
        body: JSON.stringify({ usuarioId }), // Enviar usuarioId en el body
      });
  
      if (response.ok) {
        alert("Producto eliminado correctamente");
        fetchData(); // Recargar lista de productos
      } else {
        const errorData = await response.json();
        alert("Error al eliminar el producto: " + errorData.message);
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };
  const handleEdit = (producto) => {
    setEditProducto(producto);
  };
  const exportToCSV = () => {
    const encabezados = ['Codigo', 'Nombre', 'Precio', 'Stock', 'Proveedor', 'Categoría', 'Imagen URL', 'Stock Mínimo'];
    const filas = productosFiltrados.map((producto) => [
      producto.codigoBarras,
      producto.nombre,
      producto.precio,
      producto.stock,
      proveedores.find((p) => p.id === producto.proveedorId)?.nombre || 'N/A',
      categorias.find((c) => c.id === producto.categoriaId)?.nombre || 'N/A',
      producto.imagenUrl,
      producto.stockMinimo,
    ]);
    const contenidoCSV = [encabezados, ...filas]
      .map((fila) => fila.map((item) => `"${item}"`).join(','))
      .join('\n');
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'productos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container">
      <h1>Inventario</h1>

      {/* Campo de búsqueda */}
      <input
        type="text"
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={handleSearch}
        className="search-input"
      />

      <h2>{editProducto ? 'Editar Producto' : 'Agregar Producto'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre del Producto:</label>
          <input
            type="text"
            name="nombre"
            value={editProducto ? editProducto.nombre : nuevoProducto.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Codigo de Barras:</label>
          <input
            type="text"
            name="codigoBarras"
            value={editProducto ? editProducto.codigoBarras : nuevoProducto.codigoBarras} 
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Precio:</label>
          <input
            type="number"
            name="precio"
            value={editProducto ? editProducto.precio : nuevoProducto.precio}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Stock:</label>
          <input
            type="number"
            name="stock"
            value={editProducto ? editProducto.stock : nuevoProducto.stock}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Proveedor:</label>
          <select
            name="proveedorId"
            value={editProducto ? editProducto.proveedorId : nuevoProducto.proveedorId}
            onChange={handleChange}
            required
            className="styled-select"
          >
            <option value="">Selecciona un proveedor</option>
            {proveedores.map((proveedor) => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
        <div>
          <label>Stock Minimo:</label>
          <input
            type="number"
            name="stockMinimo"
            value={editProducto ? editProducto.stockMinimo : nuevoProducto.stockMinimo}
            onChange={handleChange}
          />
        </div>
          <label>Imagen url:</label>
          <input
            type="text"
            name="imagenUrl"
            value={editProducto ? editProducto.imagenUrl : nuevoProducto.imagenUrl}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Proveedor:</label>
          <select
            name="categoriaId"
            value={editProducto ? editProducto.categoriaId : nuevoProducto.categoriaId}
            onChange={handleChange}
            required
            className="styled-select"
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>
        
        <button type="submit">{editProducto ? 'Actualizar Producto' : 'Agregar Producto'}</button>
      </form>
      <div style={{ marginBottom: '10px' }}>
  <button onClick={exportToCSV}>Exportar a CSV</button>
</div>

      {productosFiltrados.length === 0 ? (
        <p>No hay productos que coincidan con la búsqueda.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Proveedor</th>
              <th>Categoría</th>
              <th>Imagen</th>
              <th>Stock Min</th>

              {usuarioRol === 'admin' && <th>Acción</th>}
            </tr>
          </thead>
          <tbody>
  {productosFiltrados.map((producto) => {
    const stockBajo = producto.stock <= producto.stockMinimo;
    return (
      <tr key={producto.id} className={stockBajo ? 'fila-bajo-stock' : ''}>
        <td>{producto.codigoBarras}</td>
        <td>{producto.nombre}</td>
        <td>${producto.precio}</td>
        <td>{producto.stock}</td>
        <td>{proveedores.find((p) => p.id === producto.proveedorId)?.nombre || 'N/A'}</td>
        <td>{categorias.find((c) => c.id === producto.categoriaId)?.nombre || 'N/A'}</td>
        <td><img src={producto.imagenUrl} alt={producto.nombre} width="100" height="100" /></td>
        <td>{producto.stockMinimo}</td>
        {usuarioRol === 'admin' && (
          <td>
            <button className="edit-btn" onClick={() => handleEdit(producto)}>Editar</button>
            <button className="delete-btn" onClick={() => handleDelete(producto.id)}>Eliminar</button>
          </td>
        )}
      </tr>
    );
  })}
</tbody>
        </table>
      )}
    </div>
  );
}

export default Inventario;