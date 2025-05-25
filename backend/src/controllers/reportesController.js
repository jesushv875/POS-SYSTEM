// src/controllers/reportesController.js
const prisma = require('../prismaClient');  // Asegúrate de que esta ruta es correcta


const obtenerVentasPorProducto = async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    const detalles = await prisma.detalleVenta.findMany({
      where: {
        venta: {
          fecha: {
            gte: new Date(desde),
            lte: new Date(hasta),
          },
        },
      },
      include: {
        producto: true,
      },
    });

    const ventas = detalles.reduce((acc, item) => {
      const key = item.productoId;
      if (!acc[key]) {
        acc[key] = {
          productoId: key,
          producto: item.producto,
          _sum: { cantidad: 0, subtotal: 0 },
        };
      }
      acc[key]._sum.cantidad += item.cantidad;
      acc[key]._sum.subtotal += Number(item.subtotal);
      return acc;
    }, {});

    res.json(Object.values(ventas));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el reporte de ventas' });
  }
};

const obtenerInventarioBajo = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        stock: {
          lte: prisma.producto.fields.stockMinimo,
        },
      },
      select: {
        id: true,
        nombre: true,
        stock: true,
        stockMinimo: true,
      },
    });

    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos con inventario bajo' });
  }
};


const obtenerVentasMensuales = async (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({ error: 'Parámetros "desde" y "hasta" son requeridos' });
  }

  try {
    const ventas = await prisma.venta.findMany({
      where: {
        fecha: {
          gte: new Date(desde),
          lte: new Date(hasta)
        }
      },
      select: {
        fecha: true,
        total: true
      }
    });

    const ventasPorMes = {};

    ventas.forEach(({ fecha, total }) => {
      const fechaObj = new Date(fecha);
      const mes = fechaObj.toLocaleString('default', { month: 'long' });
      if (!ventasPorMes[mes]) ventasPorMes[mes] = 0;
      ventasPorMes[mes] += Number(total);
    });

    const resultado = Object.keys(ventasPorMes).map(mes => ({
      mes,
      total: Number(ventasPorMes[mes].toFixed(2))
    }));

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener ventas mensuales:", error);
    res.status(500).json({ error: 'Error al procesar el reporte de ventas mensuales' });
  }
};

module.exports = {
  obtenerVentasPorProducto,
  obtenerInventarioBajo,
  obtenerVentasMensuales
};