require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const proveedoresRoutes = require("./routes/proveedoresRoutes");
const productosRoutes = require("./routes/productosRoutes");
const usuariosRoutes = require('./routes/usuarios.routes');
const logsRoutes = require('./routes/logsRoutes');
const ventasRoutes = require('./routes/ventas');
const categoriasRoutes = require('./routes/categoriasRoutes');
const cajaRoutes = require('./routes/cajaRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const reportesRoutes = require('./routes/reportesRoutes');


const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas principales
app.use('/api/auth', authRoutes);
app.use("/api/proveedores", proveedoresRoutes);  // Solo una vez
app.use("/api/productos", productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api', logsRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/caja', cajaRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/reportes', reportesRoutes);

// Servir imágenes públicas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('El servidor está funcionando correctamente');
});

// Manejo global de rutas no encontradas
app.use((req, res) => {
  res.status(404).send('Ruta no encontrada');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});