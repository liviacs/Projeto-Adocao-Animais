const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const { body, param, validationResult } = require('express-validator');

function autenticado(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.status(401).json({ erro: 'Não autenticado. Faça login primeiro.' });
}

function formatarUsuario(row) {
  return {
    id: String(row.id_usuario),
    nome: row.nome,
    email: row.email,
    perfil: row.tipo || 'adotante',
    telefone: row.telefone || null,
    ativo: true,
    criadoEm: row.data_cadastro,
  };
}

router.get('/', autenticado, async (req, res) => {
  try {
    const { pagina = 1, porPagina = 10, busca } = req.query;
    const offset = (Number(pagina) - 1) * Number(porPagina);
    const params = [];
    let where = '';

    if (busca) {
      params.push(`%${busca}%`);
      where = `WHERE nome ILIKE $1 OR email ILIKE $1`;
    }

    const countResult = await db.query(`SELECT COUNT(*) FROM usuarios ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(Number(porPagina), offset);
    const result = await db.query(
      `SELECT id_usuario, nome, email, telefone, tipo, data_cadastro
       FROM usuarios ${where}
       ORDER BY data_cadastro DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      dados: result.rows.map(formatarUsuario),
      total,
      pagina: Number(pagina),
      porPagina: Number(porPagina),
      totalPaginas: Math.ceil(total / Number(porPagina)),
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.post('/', [
  body('nome').notEmpty().withMessage('Nome é obrigatório').trim(),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('telefone').optional().trim(),
  body('tipo').optional().isIn(['usuario', 'admin', 'adotante']).withMessage('Tipo inválido'),
], async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  try {
    const { nome, email, senha, telefone, tipo } = req.body;

    const existente = await db.query('SELECT id_usuario FROM usuarios WHERE email = $1', [email]);
    if (existente.rows.length > 0) return res.status(400).json({ erro: 'Email já cadastrado' });

    const hashSenha = await bcrypt.hash(senha, 10);
    const result = await db.query(
      `INSERT INTO usuarios (nome, email, senha, telefone, tipo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, nome, email, telefone, tipo, data_cadastro`,
      [nome, email, hashSenha, telefone || null, tipo || 'adotante']
    );

    res.status(201).json(formatarUsuario(result.rows[0]));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('senha').notEmpty().withMessage('Senha é obrigatória'),
], async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  try {
    const { email, senha } = req.body;
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const usuario = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ erro: 'Credenciais inválidas' });

    req.session.usuario = {
      id: usuario.id_usuario,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
    };

    res.json({ mensagem: 'Login realizado com sucesso', usuario: formatarUsuario(usuario) });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ erro: 'Erro ao encerrar sessão' });
    res.clearCookie('connect.sid');
    res.json({ mensagem: 'Logout realizado com sucesso' });
  });
});

router.get('/me', autenticado, (req, res) => {
  res.json({ usuario: req.session.usuario });
});

router.patch('/:id', autenticado, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  body('email').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('senha').optional().isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  body('telefone').optional().trim(),
  body('tipo').optional().isIn(['usuario', 'admin', 'adotante']).withMessage('Tipo inválido'),
], async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  try {
    const { id } = req.params;
    const { nome, email, senha, telefone, tipo } = req.body;

    const usuario = await db.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id]);
    if (usuario.rows.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });

    const atual = usuario.rows[0];
    const senhaFinal = senha ? await bcrypt.hash(senha, 10) : atual.senha;

    const result = await db.query(
      `UPDATE usuarios SET nome=$1, email=$2, senha=$3, telefone=$4, tipo=$5
       WHERE id_usuario=$6
       RETURNING id_usuario, nome, email, telefone, tipo, data_cadastro`,
      [nome ?? atual.nome, email ?? atual.email, senhaFinal, telefone ?? atual.telefone, tipo ?? atual.tipo, id]
    );

    res.json(formatarUsuario(result.rows[0]));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.delete('/:id', autenticado, async (req, res) => {
  try {
    if (req.session.usuario.tipo !== 'admin') {
      return res.status(403).json({ erro: 'Acesso negado. Apenas admins podem excluir usuários.' });
    }

    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario, nome', [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json({ mensagem: 'Usuário removido com sucesso', usuario: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
