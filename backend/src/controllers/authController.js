const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Inicio de sesión
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { correo: email },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol,
        correo: usuario.correo,
        nombre: usuario.nombre
      },
      'tu_secreto_jwt',
      { expiresIn: '1h' }
    );

    res.json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Verificación de contraseña sin iniciar sesión
const verifyPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { correo: email },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, usuario.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    res.json({ message: 'Contraseña válida' });
  } catch (error) {
    console.error('Error al verificar contraseña:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
// Al final de tu archivo
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token mal formado' });
  }

  try {
    const decoded = jwt.verify(token, 'tu_secreto_jwt');
    req.usuario = decoded;
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(403).json({ message: 'Token inválido' });
  }
};

module.exports = { 
  login, 
  verifyPassword, 
  verificarToken 
};
