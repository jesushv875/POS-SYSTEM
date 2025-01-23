const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Controlador para manejar el inicio de sesión
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar al usuario por su correo
    const usuario = await prisma.usuario.findUnique({
      where: { correo: email },
    });

    // Validar si el usuario existe
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar el token JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      'tu_secreto_jwt', // Cambia esto por una clave secreta más segura
      { expiresIn: '1h' }
    );

    res.json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = { login };  // Asegúrate de exportar la función