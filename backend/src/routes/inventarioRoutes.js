const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
router.post('/entrada', upload.single('imagen'), inventarioController.registrarEntrada);

// ✅ Registrar salida
router.post('/salida', upload.single('imagen'), inventarioController.registrarSalida);

module.exports = router;