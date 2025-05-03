const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/nueva', async (req, res) => {
  const { usuarioId, productos, total, metodoPago, pagoEfectivo, pagoTarjeta, montoPagado, cambio } = req.body;

  if (!usuarioId || !productos || productos.length === 0 || !total) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  try {
    // 1. Crear la venta
    const venta = await prisma.venta.create({
      data: {
        usuarioId,
        total,
        metodoPago,
        pagoEfectivo,
        pagoTarjeta,
        montoPagado,
        cambio,
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

    // 2. Actualizar stock de productos
    for (const p of productos) {
      await prisma.producto.update({
        where: { id: p.id },
        data: { stock: { decrement: p.cantidad } },
      });
    }

    // 3. Registrar log
    await prisma.log.create({
      data: {
        usuarioId,
        accion: 'Venta realizada',
        entidad: 'Venta',
        entidadId: venta.id,
        detalles: `Venta de $${total} (${metodoPago})`,
      },
    });
    

    // 4. Actualizar total en caja (solo sumar el efectivo recibido)
    const cajaHoy = await prisma.caja.findFirst({
      orderBy: { fecha: 'desc' },
    });

    if (cajaHoy) {
      await prisma.caja.update({
        where: { id: cajaHoy.id },
        data: {
          totalVentas: { increment: total },
          totalEnCaja: { increment: pagoEfectivo }, // SOLO suma efectivo
        },
      });
    }

    res.status(201).json(venta);
  } catch (error) {
    console.error('Error en venta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener historial de ventas
router.get('/', async (req, res) => {
  try {
    const ventas = await prisma.venta.findMany({
      include: { detalles: { include: { producto: true } }, usuario: true },
      orderBy: { fecha: 'desc' },
    });

    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;