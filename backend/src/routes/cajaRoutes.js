const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient'); 
const cajaController = require('../controllers/cajaController');


// Obtener o crear la caja del día
router.get('/hoy', async (req, res) => {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Resetear hora para comparar solo fecha
  
      let caja = await prisma.caja.findFirst({
        where: {
          fecha: {
            gte: hoy,
          },
        },
      });
  
      if (!caja) {
        caja = await prisma.caja.create({
          data: {
            fondoInicial: 0,
            totalVentas: 0,
            totalEnCaja: 0,
          },
        });
      }
  
      res.json(caja);
    } catch (error) {
      console.error('Error al obtener o crear la caja de hoy:', error);
      res.status(500).json({ message: 'Error al obtener/crear caja' });
    }
  });
// en cajaRoutes.js
router.put('/fondo', async (req, res) => {
    const { fondoInicial } = req.body;
    try {
      const caja = await prisma.caja.findFirst({
        orderBy: { fecha: 'desc' }
      });
  
      const actualizada = await prisma.caja.update({
        where: { id: caja.id },
        data: { fondoInicial }
      });
  
      res.json(actualizada);
    } catch (error) {
      console.error('Error al actualizar fondo:', error);
      res.status(500).json({ message: 'Error al actualizar fondo' });
    }
  });
  

router.post('/iniciar', cajaController.iniciarCaja);
router.post('/ingreso', cajaController.ingresarFondos);
router.post('/egreso', cajaController.egresarFondos);

module.exports = router;