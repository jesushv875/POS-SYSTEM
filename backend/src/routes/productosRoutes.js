const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken'); // Si estás usando JWT para autenticación
const multer = require('multer');
const path = require('path');

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/productos'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

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
      include: { proveedor: true, categoria: true },
    });
    res.json(productos); // Devuelve los productos al frontend
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Ruta para agregar un producto
router.post('/agregar', upload.single('imagen'), async (req, res) => {
  console.log('REQ BODY:', req.body);
  const { nombre, precio, stock, proveedorId, usuarioId, categoriaId, codigoBarras, stockMinimo, pasillo, anaquel, piso } = req.body;
  const imagenUrl = req.file ? `/uploads/productos/${req.file.filename}` : req.body.imagenUrl;

  // Validación de datos
  if (!nombre?.trim() || isNaN(parseFloat(precio)) || isNaN(parseInt(proveedorId)) || isNaN(parseInt(usuarioId))) {
    return res.status(400).json({ message: 'Todos los campos obligatorios deben estar completos' });
  }

  try {
    // Verificar si ya existe un producto con el mismo código de barras
    const codigoExistente = await prisma.producto.findUnique({
      where: { codigoBarras },
    });

    if (codigoExistente) {
      return res.status(400).json({ message: 'Ya existe un producto con este código de barras' });
    }

    // Crear el producto con los nuevos campos
    const producto = await prisma.producto.create({
      data: {
        nombre,
        precio: parseFloat(precio),
        stock: stock ? parseInt(stock) : null,
        proveedorId: parseInt(proveedorId),
        categoriaId: categoriaId ? parseInt(categoriaId) : null,
        codigoBarras,
        imagenUrl,
        stockMinimo: stockMinimo ? parseInt(stockMinimo) : null,
        pasillo,
        anaquel,
        piso,
      },
    });

    // Crear el log
    await prisma.log.create({
      data: {
        usuarioId: parseInt(usuarioId, 10),
        accion: 'Crear',
        entidad: 'Producto',
        entidadId: producto.id,
        detalles: `Producto ${producto.nombre} creado con código de barras ${codigoBarras}.`,
      },
    });

    res.status(201).json(producto);
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

router.put('/:id', upload.single('imagen'), async (req, res) => {
  const { nombre, precio, stock, proveedorId, categoriaId, codigoBarras, stockMinimo, usuarioId, pasillo, anaquel, piso } = req.body;
  const imagenUrl = req.file ? `/uploads/productos/${req.file.filename}` : req.body.imagenUrl;

  try {
    const productoActualizado = await prisma.producto.update({
      where: { id: parseInt(req.params.id) },
      data: {
        nombre,
        precio: parseFloat(precio),
        stock: stock ? parseInt(stock) : null,
        proveedorId: proveedorId ? parseInt(proveedorId) : null,
        categoriaId: categoriaId ? parseInt(categoriaId) : null,
        codigoBarras,
        imagenUrl,
        stockMinimo: stockMinimo ? parseInt(stockMinimo) : null,
        pasillo,
        anaquel,
        piso,
      },
    });

    // Registrar log de actualización
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