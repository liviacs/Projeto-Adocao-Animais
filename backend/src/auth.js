const jwt = require('jsonwebtoken');

const SECRET_KEY = '711126ddc6b1739630893596cb25c3acfc62f1c195e1eb492f8897beedb8b849fcc7957248d29e4b29235ec5c805c93e05ecc2815a9ec8366218bcc607853f51';

// Middleware para verificar o token
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ erro: 'Token não informado' });
  }

  const tokenLimpo = token.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(tokenLimpo, SECRET_KEY);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

// Middleware para verificar se é ADMIN (usar sempre DEPOIS de verificarToken)
const verificarAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.tipo !== 'ADMIN') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  }
  next();
};

module.exports = { verificarToken, verificarAdmin, SECRET_KEY };