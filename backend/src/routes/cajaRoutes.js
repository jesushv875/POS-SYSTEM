const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cajaController = require('../controllers/cajaController');

// Obtener la caja activa
router.get('/hoy', async (req, res) => {
  try {
    const caja = await prisma.caja.findFirst({
      where: { estado: true }
    });

    if (!caja) {
      return res.json(null);
    }

    res.json(caja);
  } catch (error) {
    console.error('Error al obtener caja activa:', error);
    res.status(500).json({ message: 'Error al obtener caja activa' });
  }
});

// Actualizar fondo inicial
router.put('/fondo', async (req, res) => {
  const { fondoInicial, usuarioId } = req.body;
  try {
    const caja = await prisma.caja.findFirst({ where: { estado: true } });

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
router.put('/cerrar', async (req, res) => {
  try {
    const cajaActual = await prisma.caja.findFirst({
      where: { estado: true },
      orderBy: { fecha: 'desc' },
    });

    if (!cajaActual) return res.status(404).json({ message: 'Caja no encontrada o ya cerrada.' });

    // Guardamos el retiro como movimiento
    await prisma.cajaMovimiento.create({
      data: {
        cajaId: cajaActual.id,
        tipo: 'retiro',
        monto: cajaActual.totalEnCaja,
        motivo: 'Corte de caja (retiro total)',
      },
    });

    // Cerramos caja
    await prisma.caja.update({
      where: { id: cajaActual.id },
      data: {
        totalEnCaja: 0,
        estado: false,
      },
    });

    res.json({ message: 'Caja cerrada y retirada con éxito.' });
  } catch (error) {
    console.error('Error al cerrar caja:', error);
    res.status(500).json({ message: 'Error al cerrar caja.' });
  }
});

// Rutas delegadas al controlador
router.post('/iniciar', cajaController.iniciarCaja);
router.post('/ingreso', cajaController.ingresarFondos);
router.post('/egreso', cajaController.egresarFondos);
router.get('/corte', cajaController.realizarCorte);

module.exports = router;