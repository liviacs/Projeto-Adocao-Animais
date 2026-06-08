const jwt = require('jsonwebtoken');

const SECRET_KEY = 'sua_chave_secreta_aqui';

// Middleware para verificar o token
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ erro: 'Token não informado' });
  }

  // Remove o prefixo "Bearer " se existir
  const tokenLimpo = token.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(tokenLimpo, SECRET_KEY);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

module.exports = { verificarToken, SECRET_KEY };