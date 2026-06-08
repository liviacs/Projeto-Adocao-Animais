const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const { verificarToken } = require('../auth');

//Todos as solicitações
router.get('/', verificarToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id_solicitacao, id_usuario, id_animal, data_solicitacao, status
      FROM solicitacoes
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

//Busca solicitação por ID
router.get('/:id_usuario', verificarToken, async (req, res) => {
  try {
    const id_usuario = req.params.id_usuario;

    const result = await db.query(
      `SELECT * FROM solicitacoes WHERE id_usuario = $1`,
      [id_usuario]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

//Criar solicitação
router.post('/', verificarToken, async (req, res) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const { id_usuario, id_animal } = req.body;
    const data_solicitacao = moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS');

    const result = await client.query(
      `INSERT INTO solicitacoes (id_usuario, id_animal, data_solicitacao, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id_usuario, id_animal, data_solicitacao, 'PENDENTE']
    );

    await client.query(
      `UPDATE animais
       SET status = 'EM_PROCESSAMENTO'
       WHERE id_animal = $1`,
      [id_animal]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: error.message });
  } finally {
    client.release();
  }
});

//Atualizar solicitação
router.put('/:id', verificarToken, async (req, res) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const id_solicitacao = req.params.id;
    const { id_usuario, id_animal, status } = req.body;

    const result = await client.query(
      `UPDATE solicitacoes
       SET id_usuario = $1, id_animal = $2, status = $3
       WHERE id_solicitacao = $4
       RETURNING *`,
      [id_usuario, id_animal, status, id_solicitacao]
    );

    if (status === 'APROVADA') {
      await client.query(
        `UPDATE animais SET status = 'ADOTADO' WHERE id_animal = $1`,
        [id_animal]
      );
    } else if (status === 'REPROVADA') {
      await client.query(
        `UPDATE animais SET status = 'DISPONIVEL' WHERE id_animal = $1`,
        [id_animal]
      );
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;