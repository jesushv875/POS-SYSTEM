const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const proveedoresRoutes = require("./routes/proveedoresRoutes");
const productosRoutes = require("./routes/productosRoutes");
const usuariosRoutes = require('./routes/usuarios.routes');
const logsRoutes = require('./routes/logsRoutes'); // Asegúrate de importar esto



const app = express();

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:3000', // Asegúrate de que sea el puerto correcto de tu frontend
};

app.use(cors(corsOptions));  // Habilitar CORS con las opciones configuradas

// Middlewares
app.use(express.json());

// Usa las rutas
app.use('/api/auth', authRoutes);  // Ruta para la autenticación
app.use('/api/proveedores', proveedorRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/productos", productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api', logsRoutes); // Esto debe existir para que /api/logs funcione


// Inicia el servidor
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
app.get('/', (req, res) => {
    res.send('El servidor está funcionando correctamente');
  });