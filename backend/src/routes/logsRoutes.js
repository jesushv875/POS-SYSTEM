const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verificarToken, requireRol } = require('../middleware/auth');

// Solo gerente/admin pueden ver los logs del sistema
router.get('/logs', verificarToken, requireRol('admin', 'gerente'), async (req, res) => {
  try {
    const logs = await prisma.log.findMany({
      include: { usuario: { select: { id: true, nombre: true, rol: true } } },
      orderBy: { fecha: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    console.error('Error al obtener logs:', error);
    res.status(500).json({ error: 'Error al obtener logs' });
  }
});

module.exports = router;
