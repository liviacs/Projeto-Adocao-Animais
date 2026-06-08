// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Segredo do NextAuth (mesmo do .env)
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'nextauth-secret-padrao-troque-em-producao';

// Conexão com o banco
const db = require('../db');

router.post('/', async (req, res) => {
  const client = await db.connect();

  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    // 2. Buscar usuário no banco
    const result = await client.query(
      'SELECT id_usuario, nome, email, senha, tipo FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado.' });
    }

    const usuario = result.rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta.' });
    }

    const payload = {
      sub: String(usuario.id_usuario),     
      name: usuario.nome,                  
      email: usuario.email,          
      tipo: usuario.tipo,                  
    };

    const token = jwt.sign(payload, NEXTAUTH_SECRET, {
      algorithm: 'HS256',                  
      expiresIn: '24h',                   
    });

    res.json({
      message: 'Login realizado com sucesso',
      token: token,
      usuario: {
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
});

module.exports = router;