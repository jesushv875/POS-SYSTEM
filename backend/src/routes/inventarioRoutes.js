const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verificarToken, requireRol } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Registrar entradas/salidas — gerente/admin
router.post('/entrada', verificarToken, requireRol('admin', 'gerente'), upload.single('imagen'), inventarioController.registrarEntrada);
router.post('/salida',  verificarToken, requireRol('admin', 'gerente'), upload.single('imagen'), inventarioController.registrarSalida);

// Ver historial — cualquier autenticado
router.get('/entradas', verificarToken, inventarioController.obtenerEntradas);
router.get('/salidas',  verificarToken, inventarioController.obtenerSalidas);

module.exports = router;
