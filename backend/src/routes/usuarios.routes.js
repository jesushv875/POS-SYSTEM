const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const { verificarToken, requireRol } = require('../middleware/auth');

const router = express.Router();
const ROLES_VALIDOS = ['admin', 'gerente', 'empleado'];

// Solo admin puede gestionar usuarios
router.use(verificarToken, requireRol('admin'));

router.get('/', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nombre: true, correo: true, rol: true },
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

router.post('/agregar', async (req, res) => {
  const { nombre, correo, password, rol } = req.body;

  if (!nombre || !correo || !password || !rol) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: `Rol inválido. Usa: ${ROLES_VALIDOS.join(', ')}` });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const contrasenaHasheada = await bcrypt.hash(password, 12);
    const nuevoUsuario = await prisma.usuario.create({
      data: { nombre, correo, password: contrasenaHasheada, rol },
      select: { id: true, nombre: true, correo: true, rol: true },
    });
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe un usuario con ese correo' });
    }
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol } = req.body;

  if (rol && !ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: `Rol inválido. Usa: ${ROLES_VALIDOS.join(', ')}` });
  }

  // Evitar que el admin se cambie su propio rol
  if (parseInt(id) === req.usuario.id && rol && rol !== req.usuario.rol) {
    return res.status(403).json({ error: 'No puedes cambiar tu propio rol' });
  }

  try {
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: { nombre, correo, rol },
      select: { id: true, nombre: true, correo: true, rol: true },
    });
    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.usuario.id) {
    return res.status(403).json({ error: 'No puedes eliminar tu propio usuario' });
  }

  try {
    await prisma.usuario.delete({ where: { id: Number(id) } });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

module.exports = router;
