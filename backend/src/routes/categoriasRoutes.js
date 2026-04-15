const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verificarToken, requireRol } = require('../middleware/auth');

router.get('/', verificarToken, async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

router.post('/agregar', verificarToken, requireRol('admin', 'gerente'), async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const nuevaCategoria = await prisma.categoria.create({ data: { nombre } });
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar categoría' });
  }
});

router.put('/:id', verificarToken, requireRol('admin', 'gerente'), async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    const categoriaActualizada = await prisma.categoria.update({
      where: { id: Number(id) },
      data: { nombre },
    });
    res.json(categoriaActualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
});

router.delete('/:id', verificarToken, requireRol('admin', 'gerente'), async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.categoria.delete({ where: { id: Number(id) } });
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
});

module.exports = router;
