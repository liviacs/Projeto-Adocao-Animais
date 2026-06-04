const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

//Todos os usuários
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id_usuario, nome, email, telefone, tipo, data_cadastro
      FROM usuarios
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

//Criar usuário
router.post('/', async (req, res) => {
  try {
    const { nome, email, senha, telefone, tipo } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: 'Nome, email e senha são obrigatórios'
      });
    }
    const usuarioExistente = await db.query(
      'SELECT id_usuario FROM usuarios WHERE email = $1',
      [email]
    );
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({
        erro: 'Email já cadastrado'
      });
    }
    const hashSenha = await bcrypt.hash(senha, 10);
    const result = await db.query(
      `INSERT INTO usuarios (nome, email, senha, telefone, tipo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, nome, email, telefone, tipo, data_cadastro`,
      [nome, email, hashSenha, telefone, tipo || 'usuario']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, telefone, tipo } = req.body;
    const usuario = await db.query(
      'SELECT * FROM usuarios WHERE id_usuario = $1',
      [id]
    );
    if (usuario.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    const dadosAtuais = usuario.rows[0];
    let senhaFinal = dadosAtuais.senha;
    if (senha) {
      senhaFinal = await bcrypt.hash(senha, 10);
    }
    const result = await db.query(
      `UPDATE usuarios
       SET nome = $1,
           email = $2,
           senha = $3,
           telefone = $4,
           tipo = $5
       WHERE id_usuario = $6
       RETURNING id_usuario, nome, email, telefone, tipo, data_cadastro`,
      [
        nome ?? dadosAtuais.nome,
        email ?? dadosAtuais.email,
        senhaFinal,
        telefone ?? dadosAtuais.telefone,
        tipo ?? dadosAtuais.tipo,
        id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;