const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verificarToken, requireRol } = require('../middleware/auth');

// POST /api/ventas/nueva — cualquier rol autenticado puede vender
router.post('/nueva', verificarToken, async (req, res) => {
  const { productos, total, metodoPago, pagoTarjeta, montoPagado, cambio } = req.body;
  const usuarioId = req.usuario.id; // extraído del token, no del body

  if (!productos || productos.length === 0 || !total) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  // Verificar que haya una caja abierta antes de procesar la venta
  const cajaAbierta = await prisma.caja.findFirst({ where: { estado: true } });
  if (!cajaAbierta) {
    return res.status(400).json({ error: 'No hay caja abierta. Debes iniciar una caja antes de realizar ventas.' });
  }

  const tarjeta = Number(pagoTarjeta || 0);
  const totalVenta = Number(total || 0);
  let pagoEfectivoReal = 0;
  if (metodoPago === 'efectivo') {
    pagoEfectivoReal = totalVenta;
  } else if (metodoPago === 'mixto') {
    pagoEfectivoReal = totalVenta - tarjeta;
  }
  if (isNaN(pagoEfectivoReal)) pagoEfectivoReal = 0;

  try {
    const venta = await prisma.$transaction(async (tx) => {
      for (const p of productos) {
        const productoActual = await tx.producto.findUnique({ where: { id: p.id } });
        if (!productoActual || productoActual.stock < p.cantidad) {
          throw new Error(`Stock insuficiente para el producto: ${productoActual?.nombre || p.id}`);
        }
      }

      const nuevaVenta = await tx.venta.create({
        data: {
          usuarioId,
          total,
          metodoPago,
          pagoEfectivo: pagoEfectivoReal,
          pagoTarjeta: tarjeta,
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

      for (const p of productos) {
        await tx.producto.update({
          where: { id: p.id },
          data: { stock: { decrement: p.cantidad } },
        });
      }

      return nuevaVenta;
    });

    await prisma.log.create({
      data: {
        usuarioId,
        accion: 'Venta realizada',
        entidad: 'Venta',
        entidadId: venta.id,
        detalles: `Venta de $${total} (${metodoPago})`,
      },
    });

    await prisma.caja.update({
      where: { id: cajaAbierta.id },
      data: {
        totalVentas: { increment: total },
        totalEnCaja: { increment: pagoEfectivoReal },
      },
    });

    res.status(201).json(venta);
  } catch (error) {
    if (error.message.startsWith('Stock insuficiente')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error en venta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Historial de ventas — solo gerente/admin
router.get('/', verificarToken, requireRol('admin', 'gerente'), async (req, res) => {
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
