const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function crearUsuario() {
  const contrasenaPlana = 'Paramore13'; // Contraseña que quieres encriptar
  const contrasenaHasheada = await bcrypt.hash(contrasenaPlana, 10);

  try {
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre: 'Jesus Hernandez',
        correo: 'jesushv875@gmail.com',
        password: contrasenaHasheada,
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