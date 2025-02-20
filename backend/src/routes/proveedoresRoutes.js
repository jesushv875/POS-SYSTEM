const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient"); // Asegúrate de importar Prisma correctamente

// Actualizar un proveedor por ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, email, direccion } = req.body;

  try {
    const proveedorActualizado = await prisma.proveedor.update({
      where: { id: Number(id) }, // Convertir ID a número
      data: { nombre, telefono, email, direccion },
    });

    res.json(proveedorActualizado);
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    res.status(500).json({ message: "Error al actualizar proveedor" });
  }
});

// Obtener todos los proveedores
router.get("/", async (req, res) => {
  try {
    const proveedores = await prisma.proveedor.findMany();
    res.json(proveedores);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    res.status(500).json({ message: "Error al obtener proveedores" });
  }
});

// Eliminar un proveedor por ID
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const proveedorEliminado = await prisma.proveedor.delete({
        where: { id: Number(id) }, // Asegúrate de convertir el ID a número
      });
  
      res.json({ message: "Proveedor eliminado correctamente", proveedorEliminado });
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      res.status(500).json({ message: "Error al eliminar proveedor" });
    }
  });

module.exports = router;