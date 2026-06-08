const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

function autenticado(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.status(401).json({ erro: 'Não autenticado. Faça login primeiro.' });
}

//Todos os endereços
router.get('/', autenticado, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id_usuario, 
        u.nome, 
        u.email, 
        u.telefone, 
        u.tipo, 
        u.data_cadastro,
        e.id_endereco,
        e.cep,
        e.rua,
        e.numero,
        e.bairro,
        e.cidade,
        e.estado
      FROM usuarios u
      INNER JOIN enderecos e ON u.id_usuario = e.id_usuario
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

//Endereço específico
router.get('/:id', autenticado, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query(`
      SELECT 
        u.id_usuario, 
        u.nome, 
        u.email, 
        u.telefone, 
        u.tipo, 
        u.data_cadastro,
        e.id_endereco,
        e.cep,
        e.rua,
        e.numero,
        e.bairro,
        e.cidade,
        e.estado
      FROM usuarios u
      LEFT JOIN enderecos e ON u.id_usuario = e.id_usuario
      WHERE e.id_usuario = $1`, [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.put('/:id', autenticado, async (req, res) => {
  try {
    const id = req.params.id;
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