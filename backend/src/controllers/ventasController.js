exports.reporteVentas = async (req, res) => {
    const { periodo } = req.query; // "dia" o "mes"
    let filtroFecha = {};
  
    if (periodo === 'dia') {
      filtroFecha = { fecha: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } };
    } else if (periodo === 'mes') {
      filtroFecha = {
        fecha: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      };
    }
  
    try {
      const ventas = await prisma.venta.findMany({
        where: filtroFecha,
        select: { fecha: true, total: true },
      });
  
      const totalVentas = ventas.reduce((acc, venta) => acc + parseFloat(venta.total), 0);
  
      res.json({ totalVentas, ventas });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el reporte' });
    }
  };