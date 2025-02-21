const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// Crear un nuevo usuario
router.post('/agregar', async (req, res) => {
  const { nombre, correo, password, rol } = req.body;

  if (!nombre || !correo || !password || !rol) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const contrasenaHasheada = await bcrypt.hash(password, 10);
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        correo,
        password: contrasenaHasheada,
        rol,
      },
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

// Actualizar un usuario
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol } = req.body;

  try {
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: { nombre, correo, rol },
    });

    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});

// Eliminar un usuario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.usuario.delete({
      where: { id: Number(id) },
    });

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

module.exports = router;