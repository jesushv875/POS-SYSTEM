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

const allowedOriginPatterns = [
  /^https?:\/\/localhost(:\d+)?$/,   // local dev (3000, 5173, etc.)
  /^https:\/\/.*\.ngrok-free\.app$/, // any ngrok public URL
    /^https:\/\/.*\.vercel\.app$/

];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // allow same-origin and curl/postman
    const ok = allowedOriginPatterns.some(rx => rx.test(origin));
    return ok ? callback(null, true) : callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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