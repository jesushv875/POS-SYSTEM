const prisma = require('../prismaClient'); // Asegúrate de que esta ruta sea correcta

// Función para registrar logs
async function registrarLog(usuarioId, accion, entidad, detalles) {
  try {
    const log = await prisma.log.create({
      data: {
        usuarioId,
        accion,
        entidad,
        detalles: JSON.stringify(detalles), // Puedes guardar los detalles como un string JSON
      },
    });
    return log; // Regresar el log registrado
  } catch (error) {
    console.error('Error al registrar el log:', error);
    throw new Error('Error al registrar el log');
  }
}

module.exports = { registrarLog };