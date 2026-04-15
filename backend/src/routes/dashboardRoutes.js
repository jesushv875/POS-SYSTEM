const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verificarToken, requireRol } = require('../middleware/auth');

// GET /api/dashboard — métricas del día para gerente/admin
router.get('/', verificarToken, requireRol('admin', 'gerente'), async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [caja, ventasHoy, productosBajoStock, ultimasVentas] = await Promise.all([
      prisma.caja.findFirst({ where: { estado: true } }),

      prisma.venta.aggregate({
        where: { fecha: { gte: hoy } },
        _count: { id: true },
        _sum: { total: true },
      }),

      prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "Producto"
        WHERE "stockMinimo" IS NOT NULL AND stock IS NOT NULL AND stock <= "stockMinimo"
      `,

      prisma.venta.findMany({
        take: 8,
        orderBy: { fecha: 'desc' },
        include: { usuario: { select: { nombre: true } } },
      }),
    ]);

    res.json({
      caja,
      ventasHoy: ventasHoy._count.id,
      totalVentasHoy: Number(ventasHoy._sum.total || 0),
      productosBajoStock: Number(productosBajoStock[0]?.count || 0),
      ultimasVentas,
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

module.exports = router;
