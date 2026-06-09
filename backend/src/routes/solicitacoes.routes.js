const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const { verificarToken, verificarAdmin } = require('../auth');

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

    // notifica todos os admins sobre a nova solicitação
    const admins = await client.query(`SELECT id_usuario FROM usuarios WHERE tipo = 'ADMIN'`);
    const animalInfo = await client.query(`SELECT nome FROM animais WHERE id_animal = $1`, [id_animal]);
    const nomeAnimal = animalInfo.rows[0]?.nome ?? 'um animal';
    for (const admin of admins.rows) {
      await client.query(
        `INSERT INTO notificacoes (id_usuario, tipo, mensagem) VALUES ($1, 'nova', $2)`,
        [admin.id_usuario, `Nova solicitação de adoção para ${nomeAnimal}`]
      );
    }

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
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
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

    // notifica o adotante sobre o resultado
    const animalInfo = await client.query(`SELECT nome FROM animais WHERE id_animal = $1`, [id_animal]);
    const nomeAnimal = animalInfo.rows[0]?.nome ?? 'o animal';
    if (status === 'APROVADA') {
      await client.query(
        `INSERT INTO notificacoes (id_usuario, tipo, mensagem) VALUES ($1, 'aprovada', $2)`,
        [id_usuario, `Sua solicitação para adotar ${nomeAnimal} foi aprovada!`]
      );
    } else if (status === 'REPROVADA') {
      await client.query(
        `INSERT INTO notificacoes (id_usuario, tipo, mensagem) VALUES ($1, 'rejeitada', $2)`,
        [id_usuario, `Sua solicitação para adotar ${nomeAnimal} foi recusada.`]
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