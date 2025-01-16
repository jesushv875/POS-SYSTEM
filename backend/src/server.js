require('dotenv').config();
const express = require('express');
const cors = require('cors');
//const PORT = process.env.PORT || 5001;
const productoRoutes = require('./routes/productoRoutes');

const app = express();

// Otros middlewares y configuraciones

// Middlewares
app.use(cors());
app.use(express.json());

// Otros middlewares y configuraciones

app.use('/api', productoRoutes); // Ruta base para todas las API

// Routes
app.use(cors({
    origin: 'http://localhost:3000' // Cambia esto por la URL de tu frontend
  }));
  
app.get('/', (req, res) => {
  res.send('Punto de Venta Backend funcionando');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
//app.listen(5001, () => {
//    console.log('Servidor corriendo en el puerto 5001');
//  });