const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient'); // Asegúrate de tener Prisma configurado

// Ruta para agregar un nuevo proveedor
router.post('/agregar', async (req, res) => {
  const { nombre, telefono, email, direccion } = req.body;

  try {
    const nuevoProveedor = await prisma.proveedor.create({
      data: { nombre, telefono, email, direccion },
    });

    res.status(201).json({ message: 'Proveedor agregado exitosamente', proveedor: nuevoProveedor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar el proveedor' });
  }
});

module.exports = router;