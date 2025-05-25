const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
//const logController = require('../controllers/logController'); // 👈 Importar logController

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ Registrar entrada
router.post('/entrada', upload.single('imagen'), async (req, res) => {
  try {
    const movimiento = await inventarioController.registrarEntrada(req, res, true);
    if (movimiento && movimiento.id) {
      await logController.registrarLog({
        usuarioId: movimiento.usuarioId,
        accion: `Entrada registrada ID: ${movimiento.id} Motivo: ${movimiento.motivo}`,
      });
    }
  } catch (error) {
    console.error('Error al registrar entrada con log:', error);
  }
});

// ✅ Registrar salida
router.post('/salida', upload.single('imagen'), async (req, res) => {
  try {
    const movimiento = await inventarioController.registrarSalida(req, res, true);
    if (movimiento && movimiento.id) {
      await logController.registrarLog({
        usuarioId: movimiento.usuarioId,
        accion: `Salida registrada ID: ${movimiento.id} Motivo: ${movimiento.motivo}`,
      });
    }
  } catch (error) {
    console.error('Error al registrar salida con log:', error);
  }
});

// ✅ Obtener entradas
router.get('/entradas', inventarioController.obtenerEntradas);

// ✅ Obtener salidas
router.get('/salidas', inventarioController.obtenerSalidas);

module.exports = router;