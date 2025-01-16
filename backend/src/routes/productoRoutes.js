const express = require('express');
const { crearProducto, obtenerProductos } = require('../controllers/productoController'); // Asegúrate de que la ruta sea correcta

const router = express.Router();

// Rutas para los productos
router.post('/productos', crearProducto);
router.get('/productos', obtenerProductos);

module.exports = router;