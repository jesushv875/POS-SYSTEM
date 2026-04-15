const prisma = require('../prismaClient');

// Iniciar caja con un fondo inicial
exports.iniciarCaja = async (req, res) => {
  const { fondoInicial } = req.body;
  const usuarioId = req.usuario?.id;

  try {
    await prisma.caja.updateMany({
      where: { estado: true },
      data: { estado: false }
    });

    const caja = await prisma.caja.create({
      data: {
        fondoInicial,
        totalEnCaja: fondoInicial,
        estado: true,
      },
    });
    res.json(caja);
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar la caja' });
  }
};

// Agregar fondos a la caja
exports.ingresarFondos = async (req, res) => {
  const { monto, motivo } = req.body;

  try {
    const caja = await prisma.caja.findFirst({ where: { estado: true } });
    if (!caja) return res.status(400).json({ error: 'No hay caja abierta' });

    await prisma.cajaMovimiento.create({
      data: { tipo: 'ingreso', monto, motivo, cajaId: caja.id },
    });

    await prisma.caja.update({
      where: { id: caja.id },
      data: { totalEnCaja: { increment: monto } },
    });

    res.json({ message: 'Ingreso registrado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al ingresar fondos' });
  }
};

// Retirar fondos para pagos
exports.egresarFondos = async (req, res) => {
  const { monto, motivo } = req.body;

  try {
    const caja = await prisma.caja.findFirst({ where: { estado: true } });
    if (!caja) return res.status(400).json({ error: 'No hay caja abierta' });

    if (caja.totalEnCaja < monto) {
      return res.status(400).json({ error: 'Fondos insuficientes' });
    }

    await prisma.cajaMovimiento.create({
      data: { tipo: 'egreso', monto, motivo, cajaId: caja.id },
    });

    await prisma.caja.update({
      where: { id: caja.id },
      data: { totalEnCaja: { decrement: monto } },
    });

    res.json({ message: 'Egreso registrado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al retirar fondos' });
  }
};

// Realizar corte de caja (resumen)
exports.realizarCorte = async (req, res) => {
  try {
    const caja = await prisma.caja.findFirst({
      where: { estado: true },
      include: { movimientos: true },
    });

    if (!caja) {
      return res.status(400).json({ error: 'No hay caja abierta' });
    }

    const ventas = await prisma.venta.findMany({
      where: { fecha: { gte: caja.fecha } },
    });

    const efectivo = ventas.reduce((sum, v) => sum + Number(v.pagoEfectivo || 0), 0);
    const tarjeta = ventas.reduce((sum, v) => sum + Number(v.pagoTarjeta || 0), 0);
    const totalVentas = efectivo + tarjeta;

    // Bug fix: usar `mov` (parámetro del reduce) en lugar de `m`
    const ingresos = caja.movimientos
      .filter(mov => mov.tipo === 'ingreso')
      .reduce((acc, mov) => acc + Number(mov.monto), 0);

    const egresos = caja.movimientos
      .filter(mov => mov.tipo === 'egreso')
      .reduce((acc, mov) => acc + Number(mov.monto), 0);

    const resumen = {
      fecha: caja.fecha,
      fondoInicial: Number(caja.fondoInicial || 0),
      totalVentas,
      efectivo,
      tarjeta,
      ingresos,
      egresos,
      totalEnCaja: Number(caja.fondoInicial || 0) + efectivo,
    };

    res.json(resumen);
  } catch (error) {
    console.error('Error al realizar corte de caja:', error);
    res.status(500).json({ error: 'Error al realizar corte de caja' });
  }
};
