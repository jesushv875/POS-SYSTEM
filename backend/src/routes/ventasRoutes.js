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
      const total = productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

      const venta = await prisma.venta.create({
        data: {
          usuarioId,
          total,
          metodoPago: req.body.metodoPago,
          pagoEfectivo: req.body.pagoEfectivo,
          pagoTarjeta: req.body.pagoTarjeta,
          montoPagado: req.body.montoPagado,
          cambio: req.body.cambio,
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

      const cajaHoy = await prisma.caja.findFirst({
        where: { cerrada: false },
        orderBy: { fecha: 'desc' },
      });

      await prisma.caja.update({
        where: { id: cajaHoy.id },
        data: {
          totalVentas: { increment: total },
          totalEnCaja: { increment: req.body.pagoEfectivo },
        },
      });

      await prisma.log.create({
        data: {
          usuarioId,
          accion: 'Venta realizada',
          entidad: 'Venta',
          entidadId: venta.id,
          detalles: `Productos vendidos: ${productos.map(p => `${p.nombre} (${p.cantidad})`).join(', ')}`,
        },
      });

      await prisma.log.create({
        data: {
          usuarioId,
          accion: 'Actualización de caja por venta',
          entidad: 'Caja',
          entidadId: cajaHoy.id,
          detalles: `Se incrementó totalVentas en $${total} y totalEnCaja en $${req.body.pagoEfectivo}`,
        },
      });
  
      res.status(201).json(venta);
    } catch (error) {
      console.error('Error en venta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

module.exports = router;