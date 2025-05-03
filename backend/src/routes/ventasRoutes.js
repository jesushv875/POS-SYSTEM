const express = require('express');
const router = express.Router();
const cajaController = require('../controllers/cajaController');

router.post('/iniciar', cajaController.iniciarCaja);
router.post('/ingreso', cajaController.ingresarFondos);
router.post('/egreso', cajaController.egresarFondos);
// Registrar una nueva venta
router.post('/nueva', async (req, res) => {
    const { usuarioId, productos } = req.body;
  
    if (!usuarioId || !productos || productos.length === 0) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }
  
    try {
      const venta = await prisma.venta.create({
        data: {
          usuarioId,
          detalles: {
            create: productos.map((p) => ({
              productoId: p.id,
              cantidad: p.cantidad,
              subtotal: p.cantidad * p.precio,
            })),
          },
        },
        include: { detalles: true },
      });
  
      // Descontar stock de cada producto
      for (const p of productos) {
        await prisma.producto.update({
          where: { id: p.id },
          data: { stock: { decrement: p.cantidad } },
        });
      }
  
      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId,
          accion: 'Venta realizada',
          entidad: 'Venta',
          entidadId: venta.id,
          detalles: `Productos vendidos: ${productos.map(p => `${p.nombre} (${p.cantidad})`).join(', ')}`,
        },
      });
  
      res.status(201).json(venta);
    } catch (error) {
      console.error('Error en venta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

module.exports = router;