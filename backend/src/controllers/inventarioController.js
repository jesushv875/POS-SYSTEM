const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.registrarMovimiento = async (req, res, tipo) => {
    
  try {
    console.log('BODY COMPLETO:', req.body);

    console.log('Datos recibidos en el body:', req.body);

    const { productoId, motivo, cantidad, comentario, usuarioId } = req.body;

    console.log('UsuarioId recibido:', usuarioId);
    console.log('UsuarioId recibido:', usuarioId, 'Tipo:', typeof usuarioId);

if (!usuarioId || isNaN(parseInt(usuarioId))) {
  console.error('UsuarioId no válido:', usuarioId);
  return res.status(400).json({ message: 'UsuarioId inválido o ausente.' });
}

    if (!productoId || !motivo || !cantidad || !usuarioId) {
      return res.status(400).json({ message: 'Producto, motivo, cantidad y usuarioId son obligatorios.' });
    }

    const cantidadInt = parseInt(cantidad);
    if (isNaN(cantidadInt) || cantidadInt <= 0) {
      return res.status(400).json({ message: 'Cantidad inválida.' });
    }

    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(productoId) },
    });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    let imagenUrl = null;
    if (req.file) {
      imagenUrl = `/uploads/${req.file.filename}`;
    }

    // Registrar movimiento
    const movimiento = await prisma.movimientoInventario.create({
      data: {
        tipo,
        motivo,
        cantidad: cantidadInt,
        comentario,
        imagenUrl,
        usuarioId: parseInt(usuarioId),
        productoId: parseInt(productoId),
      },
    });

    // Actualizar stock
    let nuevoStock = tipo === 'entrada'
      ? (producto.stock ?? 0) + cantidadInt
      : (producto.stock ?? 0) - cantidadInt;

    if (nuevoStock < 0) nuevoStock = 0;

    await prisma.producto.update({
      where: { id: parseInt(productoId) },
      data: { stock: nuevoStock },
    });

    res.json({ message: `Movimiento de ${tipo} registrado correctamente.` });
  } catch (error) {
    console.error('Error en movimiento inventario:', error);
    res.status(500).json({ message: 'Error al procesar movimiento.' });
  }
};

// inventarioController.js


exports.obtenerEntradas = async (req, res) => {
  try {
    const entradas = await prisma.movimientoInventario.findMany({
      where: { tipo: 'entrada' },
      orderBy: { fecha: 'desc' },
    });

    res.json(entradas);
  } catch (error) {
    console.error('Error al obtener entradas:', error);
    res.status(500).json({ message: 'Error al obtener entradas' });
  }
};

exports.obtenerSalidas = async (req, res) => {
  try {
    const salidas = await prisma.movimientoInventario.findMany({
      where: { tipo: 'salida' },
      orderBy: { fecha: 'desc' },
    });

    res.json(salidas);
  } catch (error) {
    console.error('Error al obtener salidas:', error);
    res.status(500).json({ message: 'Error al obtener salidas' });
  }
};


exports.registrarEntrada = (req, res) => exports.registrarMovimiento(req, res, 'entrada');
exports.registrarSalida = (req, res) => exports.registrarMovimiento(req, res, 'salida');