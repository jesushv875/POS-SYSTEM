const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken'); // Si estás usando JWT para autenticación


const prisma = new PrismaClient();

// Middleware para verificar el token y obtener el usuario
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Obtenemos el token del encabezado Authorization
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user; // Guardamos el usuario decodificado en la solicitud
    next();
  });
};

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      include: { proveedor: true }, // Opcional si quieres incluir el nombre del proveedor
    });
    res.json(productos); // Devuelve los productos al frontend
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Ruta para agregar un producto
router.post('/agregar', async (req, res) => {
  const { nombre, precio, stock, proveedorId, usuarioId } = req.body; // Obtener usuarioId desde el cuerpo de la solicitud

  // Validación de datos
  if (!nombre || !precio || !stock || !proveedorId || !usuarioId) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Crear el producto
    const producto = await prisma.producto.create({
      data: {
        nombre,
        precio: parseFloat(precio), // Asegurar que precio sea Float
        stock: parseInt(stock), // Asegurar que stock sea Int
        proveedorId: parseInt(proveedorId), // Asegurar que proveedorId sea Int
      },
    });

    // Crear el log
    await prisma.log.create({
      data: {
        usuarioId, // Usamos usuarioId directamente desde la solicitud
        accion: 'Crear',
        entidad: 'Producto',
        entidadId: producto.id,
        detalles: `Producto ${producto.nombre} creado.`,
      },
    });

    res.status(201).json(producto); // Devuelve el producto creado
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para eliminar un producto por ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { usuarioId } = req.body; // Recibir usuarioId del frontend

  try {
    const productoId = parseInt(id);
    if (isNaN(productoId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    if (!usuarioId) {
      return res.status(400).json({ message: "Usuario ID es requerido" });
    }

    // Eliminar producto
    const producto = await prisma.producto.delete({
      where: { id: productoId },
    });

    // Registrar log de eliminación
    await prisma.log.create({
      data: {
        usuarioId: parseInt(usuarioId),
        accion: "Eliminar",
        entidad: "Producto",
        entidadId: productoId,
        detalles: `Producto ${producto.nombre} eliminado.`,
      },
    });

    res.json({ message: "Producto eliminado correctamente", producto });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para actualizar un producto por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock, proveedorId, usuarioId } = req.body; // Recibir usuarioId

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

    // Crear el log de la actualización
    if (usuarioId) {
      await prisma.log.create({
        data: {
          usuarioId,
          accion: 'Actualizar',
          entidad: 'Producto',
          entidadId: productoActualizado.id,
          detalles: `Producto ${productoActualizado.nombre} actualizado.`,
        },
      });
    }

    res.json({ message: 'Producto actualizado correctamente', producto: productoActualizado });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;