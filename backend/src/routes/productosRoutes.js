const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const prisma = require('../prismaClient');
const { verificarToken, requireRol } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/productos')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Cualquier rol autenticado puede ver productos
router.get('/', verificarToken, async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      include: { proveedor: true, categoria: true },
    });
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Solo gerente/admin pueden crear, editar o eliminar
router.post('/agregar', verificarToken, requireRol('admin', 'gerente'), upload.single('imagen'), async (req, res) => {
  const { nombre, precio, stock, proveedorId, categoriaId, codigoBarras, stockMinimo, pasillo, anaquel, piso } = req.body;
  const imagenUrl = req.file ? `/uploads/productos/${req.file.filename}` : req.body.imagenUrl;
  const usuarioId = req.usuario.id;

  if (!nombre?.trim() || isNaN(parseFloat(precio))) {
    return res.status(400).json({ message: 'Nombre y precio son obligatorios' });
  }

  try {
    if (codigoBarras) {
      const codigoExistente = await prisma.producto.findUnique({ where: { codigoBarras } });
      if (codigoExistente) {
        return res.status(400).json({ message: 'Ya existe un producto con este código de barras' });
      }
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        precio: parseFloat(precio),
        stock: stock ? parseInt(stock) : null,
        proveedorId: proveedorId ? parseInt(proveedorId) : null,
        categoriaId: categoriaId ? parseInt(categoriaId) : null,
        codigoBarras: codigoBarras || null,
        imagenUrl,
        stockMinimo: stockMinimo ? parseInt(stockMinimo) : null,
        pasillo,
        anaquel,
        piso,
      },
    });

    await prisma.log.create({
      data: {
        usuarioId,
        accion: 'Crear',
        entidad: 'Producto',
        entidadId: producto.id,
        detalles: `Producto "${producto.nombre}" creado.`,
      },
    });

    res.status(201).json(producto);
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.put('/:id', verificarToken, requireRol('admin', 'gerente'), upload.single('imagen'), async (req, res) => {
  const { nombre, precio, stock, proveedorId, categoriaId, codigoBarras, stockMinimo, pasillo, anaquel, piso } = req.body;
  const imagenUrl = req.file ? `/uploads/productos/${req.file.filename}` : req.body.imagenUrl;
  const usuarioId = req.usuario.id;

  try {
    const productoActualizado = await prisma.producto.update({
      where: { id: parseInt(req.params.id) },
      data: {
        nombre,
        precio: parseFloat(precio),
        stock: stock ? parseInt(stock) : null,
        proveedorId: proveedorId ? parseInt(proveedorId) : null,
        categoriaId: categoriaId ? parseInt(categoriaId) : null,
        codigoBarras: codigoBarras || null,
        imagenUrl,
        stockMinimo: stockMinimo ? parseInt(stockMinimo) : null,
        pasillo,
        anaquel,
        piso,
      },
    });

    await prisma.log.create({
      data: {
        usuarioId,
        accion: 'Actualizar',
        entidad: 'Producto',
        entidadId: productoActualizado.id,
        detalles: `Producto "${productoActualizado.nombre}" actualizado.`,
      },
    });

    res.json({ message: 'Producto actualizado correctamente', producto: productoActualizado });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.delete('/:id', verificarToken, requireRol('admin', 'gerente'), async (req, res) => {
  const productoId = parseInt(req.params.id);
  const usuarioId = req.usuario.id;

  if (isNaN(productoId)) return res.status(400).json({ message: 'ID inválido' });

  try {
    const producto = await prisma.producto.delete({ where: { id: productoId } });

    await prisma.log.create({
      data: {
        usuarioId,
        accion: 'Eliminar',
        entidad: 'Producto',
        entidadId: productoId,
        detalles: `Producto "${producto.nombre}" eliminado.`,
      },
    });

    res.json({ message: 'Producto eliminado correctamente', producto });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
