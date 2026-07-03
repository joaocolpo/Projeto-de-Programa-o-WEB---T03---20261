const authService = require('../services/auth.service');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  try {
    const payload = authService.verifyToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

module.exports = { authenticateToken };
