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

    // bloqueia se o animal já tem solicitação PENDENTE (de qualquer usuário)
    const pendente = await client.query(
      `SELECT 1 FROM solicitacoes WHERE id_animal = $1 AND status = 'PENDENTE' LIMIT 1`,
      [id_animal]
    );
    if (pendente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ erro: 'Este animal já possui uma solicitação pendente.' });
    }

    const data_solicitacao = moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS');

    const result = await client.query(
      `INSERT INTO solicitacoes (id_usuario, id_animal, data_solicitacao, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id_usuario, id_animal, data_solicitacao, 'PENDENTE']
    );

    await client.query(
      `UPDATE animais SET status = 'EM_PROCESSO' WHERE id_animal = $1`,
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

//Atualizar solicitação (aprovar / reprovar)
router.put('/:id', verificarToken, async (req, res) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const id_solicitacao = req.params.id;
    const { id_usuario, id_animal, status, motivo_rejeicao } = req.body;

    const result = await client.query(
      `UPDATE solicitacoes
       SET id_usuario = $1, id_animal = $2, status = $3, motivo_rejeicao = $4
       WHERE id_solicitacao = $5
       RETURNING *`,
      [id_usuario, id_animal, status, motivo_rejeicao || null, id_solicitacao]
    );

    if (status === 'APROVADA') {
      // animal vira ADOTADO
      await client.query(
        `UPDATE animais SET status = 'ADOTADO' WHERE id_animal = $1`,
        [id_animal]
      );
    } else if (status === 'REPROVADA') {
      // decide o status do animal conforme o motivo
      if (motivo_rejeicao === 'Pet falecido') {
        await client.query(
          `UPDATE animais SET status = 'FALECIDO' WHERE id_animal = $1`,
          [id_animal]
        );
      } else {
        // falta de documentos, desistência, outro → volta a ficar disponível
        await client.query(
          `UPDATE animais SET status = 'DISPONIVEL' WHERE id_animal = $1`,
          [id_animal]
        );
      }
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