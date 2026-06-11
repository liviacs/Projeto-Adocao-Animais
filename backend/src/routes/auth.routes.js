// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const { SECRET_KEY } = require('../auth');

// Conexão com o banco
const db = require('../db');
const log = require('../logger');

router.post('/', async (req, res) => {
  const client = await db.connect();

  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

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

    // ⭐ USE A MESMA SECRET_KEY
    const token = jwt.sign(payload, SECRET_KEY, {
      algorithm: 'HS256',                  
      expiresIn: '24h',                   
    });

    await log('info', `${usuario.nome} entrou no sistema`, usuario.email);
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

// ── Recuperação de senha ──────────────────────────────────────────────────────
// Passo 1: gera o token (simula o envio por SMS mostrando na tela)
router.post('/recuperar', async (req, res) => {
  const client = await db.connect();
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ erro: 'Informe o email.' });

    const result = await client.query('SELECT id_usuario FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Email não encontrado.' });
    }

    // token de 6 dígitos
    const token = String(Math.floor(100000 + Math.random() * 900000));
    // validade de 15 minutos
    const expira = new Date(Date.now() + 15 * 60 * 1000);

    await client.query(
      'UPDATE usuarios SET token_recuperacao = $1, token_expira = $2 WHERE email = $3',
      [token, expira, email]
    );

    // EM PRODUÇÃO: enviar por SMS/email. Aqui, retornamos pra mostrar na tela (simulação).
    res.json({ mensagem: 'Token gerado', token });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
});

// Passo 2: valida o token e redefine a senha
router.post('/redefinir', async (req, res) => {
  const client = await db.connect();
  try {
    const { email, token, novaSenha } = req.body;
    if (!email || !token || !novaSenha) {
      return res.status(400).json({ erro: 'Email, token e nova senha são obrigatórios.' });
    }
    if (novaSenha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    const result = await client.query(
      'SELECT token_recuperacao, token_expira FROM usuarios WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Email não encontrado.' });
    }

    const usuario = result.rows[0];
    if (!usuario.token_recuperacao || usuario.token_recuperacao !== token) {
      return res.status(400).json({ erro: 'Token inválido.' });
    }
    if (new Date(usuario.token_expira) < new Date()) {
      return res.status(400).json({ erro: 'Token expirado. Solicite um novo.' });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await client.query(
      'UPDATE usuarios SET senha = $1, token_recuperacao = NULL, token_expira = NULL WHERE email = $2',
      [senhaHash, email]
    );

    res.json({ mensagem: 'Senha redefinida com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;