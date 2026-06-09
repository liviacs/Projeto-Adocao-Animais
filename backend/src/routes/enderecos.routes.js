const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const { verificarToken } = require('../auth');

//Todos os endereços
router.get('/', verificarToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id_usuario, 
        u.nome, 
        u.email, 
        u.telefone, 
        u.tipo, 
        u.data_cadastro,
        u.cpf,
        u.orientacao_sexual,
        u.qtd_adocoes,
        e.id_endereco,
        e.cep,
        e.rua,
        e.numero,
        e.bairro,
        e.cidade,
        e.estado
      FROM usuarios u
      LEFT JOIN enderecos e ON u.id_usuario = e.id_usuario
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

//Endereço específico
router.get('/:id', verificarToken, async (req, res) => {
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
        u.cpf,
        u.orientacao_sexual,
        u.qtd_adocoes,
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

router.post('/:id', verificarToken, async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const { cep, rua, numero, bairro, cidade, estado } = req.body;

    if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
      return res.status(400).json({ 
        erro: 'cep, rua, número, bairro, cidade e estado são obrigatórios.' 
      });
    }

    const result = await db.query(
      `INSERT INTO enderecos 
        (id_usuario, cep, rua, numero, bairro, cidade, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [idUsuario, cep, rua, numero, bairro, cidade, estado]
    );

    res.status(201).json({
      message: 'Endereço adicionado com sucesso',
      endereco: result.rows[0]
    });
  } catch (err) {
    console.error('Erro ao adicionar endereço:', err);
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;