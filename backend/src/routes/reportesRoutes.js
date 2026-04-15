const express = require('express');
const router = express.Router();
const { obtenerVentasPorProducto, obtenerInventarioBajo, obtenerVentasMensuales } = require('../controllers/reportesController');
const { verificarToken, requireRol } = require('../middleware/auth');

// Solo gerente/admin pueden ver reportes
router.get('/ventas-producto',  verificarToken, requireRol('admin', 'gerente'), obtenerVentasPorProducto);
router.get('/inventario-bajo',  verificarToken, requireRol('admin', 'gerente'), obtenerInventarioBajo);
router.get('/ventas-mensuales', verificarToken, requireRol('admin', 'gerente'), obtenerVentasMensuales);

module.exports = router;
