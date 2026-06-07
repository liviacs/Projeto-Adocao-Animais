// src/routes/login.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;

router.post('/', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    const result = await db.query(
      `SELECT id_usuario, nome, email, senha 
       FROM usuarios WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    const usuario = result.rows[0];

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Senha incorreta' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email
      },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;