const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const cajaController = require('../controllers/cajaController');
const { verificarToken, requireRol } = require('../middleware/auth');

// Cualquier empleado autenticado puede ver el estado de la caja
router.get('/hoy', verificarToken, async (req, res) => {
  try {
    const caja = await prisma.caja.findFirst({ where: { estado: true } });
    res.json(caja || null);
  } catch (error) {
    console.error('Error al obtener caja activa:', error);
    res.status(500).json({ message: 'Error al obtener caja activa' });
  }
});

// Solo gerente/admin pueden iniciar, mover fondos y cerrar caja
router.post('/iniciar', verificarToken, requireRol('admin', 'gerente'), cajaController.iniciarCaja);
router.post('/ingreso', verificarToken, requireRol('admin', 'gerente'), cajaController.ingresarFondos);
router.post('/egreso',  verificarToken, requireRol('admin', 'gerente'), cajaController.egresarFondos);
router.get('/corte',    verificarToken, requireRol('admin', 'gerente'), cajaController.realizarCorte);

router.put('/fondo', verificarToken, requireRol('admin', 'gerente'), async (req, res) => {
  const { fondoInicial } = req.body;
  const usuarioId = req.usuario.id;
  try {
    const caja = await prisma.caja.findFirst({ where: { estado: true } });
    if (!caja) return res.status(400).json({ message: 'No hay caja abierta' });

    const actualizada = await prisma.caja.update({
      where: { id: caja.id },
      data: { fondoInicial }
    });

    await prisma.log.create({
      data: {
        usuarioId,
        accion: 'Actualización de fondo inicial',
        entidad: 'Caja',
        entidadId: actualizada.id,
        detalles: `Se actualizó el fondo inicial a $${fondoInicial}`,
      },
    });

    res.json(actualizada);
  } catch (error) {
    console.error('Error al actualizar fondo:', error);
    res.status(500).json({ message: 'Error al actualizar fondo' });
  }
});

router.put('/cerrar', verificarToken, requireRol('admin', 'gerente'), async (req, res) => {
  const usuarioId = req.usuario.id;
  try {
    const cajaActual = await prisma.caja.findFirst({
      where: { estado: true },
      orderBy: { fecha: 'desc' },
    });

    if (!cajaActual) return res.status(404).json({ message: 'Caja no encontrada o ya cerrada.' });

    await prisma.cajaMovimiento.create({
      data: {
        cajaId: cajaActual.id,
        tipo: 'retiro',
        monto: cajaActual.totalEnCaja,
        motivo: 'Corte de caja (retiro total)',
      },
    });

    await prisma.caja.update({
      where: { id: cajaActual.id },
      data: { totalEnCaja: 0, estado: false },
    });

    await prisma.log.create({
      data: {
        usuarioId,
        accion: 'Cierre de caja',
        entidad: 'Caja',
        entidadId: cajaActual.id,
        detalles: `Caja cerrada. Total retirado: $${cajaActual.totalEnCaja}`,
      },
    });

    res.json({ message: 'Caja cerrada y retirada con éxito.' });
  } catch (error) {
    console.error('Error al cerrar caja:', error);
    res.status(500).json({ message: 'Error al cerrar caja.' });
  }
});

// Movimientos de la caja activa
router.get('/movimientos', verificarToken, requireRol('admin', 'gerente'), async (req, res) => {
  try {
    const caja = await prisma.caja.findFirst({ where: { estado: true } });
    if (!caja) return res.json([]);
    const movimientos = await prisma.cajaMovimiento.findMany({
      where: { cajaId: caja.id },
      orderBy: { fecha: 'desc' },
    });
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener movimientos' });
  }
});

module.exports = router;
