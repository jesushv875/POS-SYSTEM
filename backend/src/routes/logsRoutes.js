const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Obtener todos los logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await prisma.log.findMany({
      include: {
        usuario: true, // Asegura que la relación está bien
      },
      orderBy: { fecha: 'desc' }, // Ordena por fecha de más reciente a más antiguo
    });

    res.json(logs);
  } catch (error) {
    console.error('Error al obtener logs:', error);
    res.status(500).json({ error: 'Error al obtener logs' });
  }
});


module.exports = router;