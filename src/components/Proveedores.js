import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/proveedores`)
      .then((response) => response.json())
      .then((data) => setProveedores(data))
      .catch((error) => console.error("Error al obtener proveedores:", error));
  }, []);

  return (
    <div className="container">
      <h2>Lista de Proveedores</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Dirección</th>
            <th>Fecha de Creación</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.length > 0 ? (
            proveedores.map((proveedor) => (
              <tr key={proveedor.id}>
                <td>{proveedor.id}</td>
                <td>{proveedor.nombre}</td>
                <td>{proveedor.telefono || "N/A"}</td>
                <td>{proveedor.email || "N/A"}</td>
                <td>{proveedor.direccion || "N/A"}</td>
                <td>{new Date(proveedor.creadoEn).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No hay proveedores registrados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Proveedores;