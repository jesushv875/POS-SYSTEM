// backend/src/controllers/productoController.js
const prisma = require('../prismaClient');  // Asegúrate de que esta ruta es correcta

// Crear un producto
async function crearProducto(req, res) {
  const { nombre, precio, stock, proveedorId } = req.body;
  try {
    const producto = await prisma.producto.create({
      data: { nombre, precio, stock, proveedorId },
    });
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el producto" });
  }
}

// Obtener todos los productos
const obtenerProductos = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany(); // Cambia según tu modelo
    console.log('Productos obtenidos:', productos); // Verifica los datos obtenidos
    res.status(200).json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Obtener un producto por su ID
async function obtenerProductoPorId(req, res) {
  const { id } = req.params;
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) },
    });
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
}

// Actualizar un producto
async function actualizarProducto(req, res) {
  const { id } = req.params;
  const { nombre, precio, stock, proveedorId } = req.body;
  try {
    const producto = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: { nombre, precio, stock, proveedorId },
    });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
}

// Eliminar un producto
async function eliminarProducto(req, res) {
  const { id } = req.params;
  try {
    const producto = await prisma.producto.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Producto eliminado", producto });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
}

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
};
