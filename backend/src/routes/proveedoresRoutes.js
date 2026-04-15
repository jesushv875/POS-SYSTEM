const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verificarToken, requireRol } = require('../middleware/auth');

// Cualquier autenticado puede ver proveedores
router.get('/', verificarToken, async (req, res) => {
  try {
    const proveedores = await prisma.proveedor.findMany();
    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ message: 'Error al obtener proveedores' });
  }
});

// Crear proveedor — gerente/admin
router.post('/agregar', verificarToken, requireRol('admin', 'gerente'), async (req, res) => {
  const { nombre, telefono, email, direccion } = req.body;

  if (!nombre?.trim()) {
    return res.status(400).json({ message: 'El nombre del proveedor es obligatorio' });
  }

  try {
    const nuevo = await prisma.proveedor.create({
      data: { nombre, telefono, email, direccion },
    });
    res.status(201).json(nuevo);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Ya existe un proveedor con ese email' });
    }
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ message: 'Error al crear proveedor' });
  }
});

// Actualizar — gerente/admin
router.put('/:id', verificarToken, requireRol('admin', 'gerente'), async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, email, direccion } = req.body;

  try {
    const proveedorActualizado = await prisma.proveedor.update({
      where: { id: Number(id) },
      data: { nombre, telefono, email, direccion },
    });
    res.json(proveedorActualizado);
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ message: 'Error al actualizar proveedor' });
  }
});

// Eliminar — solo admin
router.delete('/:id', verificarToken, requireRol('admin'), async (req, res) => {
  const { id } = req.params;

  try {
    const proveedorEliminado = await prisma.proveedor.delete({ where: { id: Number(id) } });
    res.json({ message: 'Proveedor eliminado correctamente', proveedorEliminado });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ message: 'Error al eliminar proveedor' });
  }
});

module.exports = router;
