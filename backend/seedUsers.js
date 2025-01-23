const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function crearUsuario() {
  const contraseñaPlana = '123456'; // Contraseña que quieres encriptar
  const contraseñaHasheada = await bcrypt.hash(contraseñaPlana, 10);

  try {
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre: 'Juan Pérez',
        correo: 'juan.perez@example.com',
        password: contraseñaHasheada,
        rol: 'admin',
      },
    });

    console.log('Usuario creado:', nuevoUsuario);
  } catch (error) {
    console.error('Error al crear usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearUsuario();