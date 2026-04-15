const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token no proporcionado' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token mal formado' });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

// requireRol('admin', 'gerente') — solo pasan esos roles
const requireRol = (...roles) => (req, res, next) => {
  if (!req.usuario) return res.status(401).json({ message: 'No autenticado' });
  if (!roles.includes(req.usuario.rol)) {
    return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
  }
  next();
};

module.exports = { verificarToken, requireRol };
