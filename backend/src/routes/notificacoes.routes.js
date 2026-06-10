const express = require('express');
const router = express.Router();
const db = require('../db');
const { verificarToken } = require('../auth');

// Listar as notificações do usuário logado
router.get('/', verificarToken, async (req, res) => {
  try {
    const id_usuario = req.usuario.sub; // vem do token
    const result = await db.query(
      `SELECT id_notificacao, id_usuario, tipo, mensagem, lida, data_criacao, id_solicitacao
       FROM notificacoes
       WHERE id_usuario = $1
       ORDER BY lida ASC, data_criacao DESC`,
      [id_usuario]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Contar não-lidas do usuário logado
router.get('/nao-lidas', verificarToken, async (req, res) => {
  try {
    const id_usuario = req.usuario.sub;
    const result = await db.query(
      `SELECT COUNT(*)::int AS total FROM notificacoes WHERE id_usuario = $1 AND lida = FALSE`,
      [id_usuario]
    );
    res.json({ total: result.rows[0].total });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Marcar uma notificação como lida
router.put('/:id/lida', verificarToken, async (req, res) => {
  try {
    const id_usuario = req.usuario.sub;
    const { id } = req.params;
    const result = await db.query(
      `UPDATE notificacoes SET lida = TRUE
       WHERE id_notificacao = $1 AND id_usuario = $2
       RETURNING *`,
      [id, id_usuario]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Notificação não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;