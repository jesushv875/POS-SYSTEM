const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      include: { proveedor: true }, // Opcional si quieres incluir el nombre del proveedor
    });
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});
// Ruta para agregar un producto
router.post('/agregar', async (req, res) => {
  const { nombre, precio, stock, proveedorId } = req.body;

  // Validación de datos
  if (!nombre || !precio || !stock || !proveedorId) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const producto = await prisma.producto.create({
      data: {
        nombre,
        precio: parseFloat(precio), // Asegurar que precio sea Float
        stock: parseInt(stock), // Asegurar que stock sea Int
        proveedorId: parseInt(proveedorId), // Asegurar que proveedorId sea Int
      },
    });

    res.status(201).json(producto);
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});
// Ruta para eliminar un producto por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const productoId = parseInt(id); // Convierte el ID a número
    if (isNaN(productoId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const producto = await prisma.producto.delete({
      where: { id: productoId },
    });

    res.json({ message: 'Producto eliminado correctamente', producto });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});
// Ruta para actualizar un producto por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock, proveedorId } = req.body;

  try {
    const productoId = parseInt(id); // Convertir el ID a número
    if (isNaN(productoId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const productoActualizado = await prisma.producto.update({
      where: { id: productoId },
      data: {
        nombre,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        proveedorId: proveedorId ? parseInt(proveedorId) : null,
      },
    });

    res.json({ message: 'Producto actualizado correctamente', producto: productoActualizado });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});
// Después de la actualización, recargamos los productos desde el servidor:
const fetchData = async () => {
  try {
    const productosResponse = await fetch('http://localhost:5001/api/productos');
    if (productosResponse.ok) {
      const productosData = await productosResponse.json();
      setProductos(productosData);
    } else {
      console.error('Error al obtener productos');
    }
  } catch (error) {
    console.error('Error al conectar con la API:', error);
  }
};

fetchData();  // Recarga la lista de productos

module.exports = router;