const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Iniciar caja con un fondo inicial
exports.iniciarCaja = async (req, res) => {
  const { fondoInicial } = req.body;
  
  try {
    const caja = await prisma.caja.create({
      data: {
        fondoInicial,
        totalEnCaja: fondoInicial,
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
    const caja = await prisma.caja.findFirst({ orderBy: { fecha: 'desc' } });
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
    const caja = await prisma.caja.findFirst({ orderBy: { fecha: 'desc' } });
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