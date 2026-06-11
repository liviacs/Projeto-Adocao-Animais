const express = require('express');
const router = express.Router();
const db = require('../db');
const { verificarToken, verificarAdmin } = require('../auth');

// GET /api/logs — apenas admin
router.get('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { tipo, busca, limite = 100 } = req.query;

    let query = `SELECT id_log, tipo, mensagem, usuario, data_criacao FROM logs`;
    const params = [];
    const condicoes = [];

    if (tipo && tipo !== 'todos') {
      params.push(tipo);
      condicoes.push(`tipo = $${params.length}`);
    }

    if (busca) {
      params.push(`%${busca}%`);
      condicoes.push(`(mensagem ILIKE $${params.length} OR usuario ILIKE $${params.length})`);
    }

    if (condicoes.length > 0) {
      query += ` WHERE ${condicoes.join(' AND ')}`;
    }

    query += ` ORDER BY data_criacao DESC LIMIT $${params.length + 1}`;
    params.push(Number(limite));

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
