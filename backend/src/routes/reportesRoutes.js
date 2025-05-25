const express = require('express');
const { obtenerVentasPorProducto, obtenerInventarioBajo, obtenerVentasMensuales } = require('../controllers/reportesController');

const router = express.Router();
router.get('/ventas-producto', obtenerVentasPorProducto);
router.get('/inventario-bajo', obtenerInventarioBajo);
router.get('/ventas-mensuales', obtenerVentasMensuales);
module.exports = router;