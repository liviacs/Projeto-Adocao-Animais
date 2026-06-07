// Rota de adoções — corrigida (bug $3 duplicado no PUT, lógica de aprovação seletiva)
const express = require('express');
const router = express.Router();
const db = require('../db');

function autenticado(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.status(401).json({ erro: 'Não autenticado. Faça login primeiro.' });
}

// GET /adocoes
router.get('/', autenticado, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        ad.id_adocao,
        ad.data_adocao,
        a.id_animal,
        a.nome   AS nome_animal,
        a.especie,
        a.raca,
        a.idade,
        a.sexo,
        a.porte,
        a.cond_saude,
        a.descricao,
        a.status AS status_animal,
        u.id_usuario,
        u.nome   AS nome_adotante,
        u.email,
        u.telefone
      FROM adocoes ad
      INNER JOIN animais   a ON a.id_animal  = ad.id_animal
      INNER JOIN usuarios  u ON u.id_usuario = ad.id_usuario
      ORDER BY ad.data_adocao DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /adocoes/:id
router.get('/:id', autenticado, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         ad.id_adocao,
         ad.data_adocao,
         a.id_animal,
         a.nome   AS nome_animal,
         a.especie,
         a.raca,
         a.idade,
         a.sexo,
         a.porte,
         a.cond_saude,
         a.descricao,
         a.status AS status_animal,
         u.id_usuario,
         u.nome   AS nome_adotante,
         u.email,
         u.telefone
       FROM adocoes ad
       LEFT JOIN animais  a ON a.id_animal  = ad.id_animal
       LEFT JOIN usuarios u ON u.id_usuario = ad.id_usuario
       WHERE ad.id_adocao = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Adoção não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /adocoes — cria adoção e aprova apenas a solicitação do adotante
router.post('/', autenticado, async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { id_usuario, id_animal } = req.body;
    if (!id_usuario || !id_animal) {
      await client.query('ROLLBACK');
      return res.status(400).json({ erro: 'id_usuario e id_animal são obrigatórios' });
    }

    // Verifica se o animal existe e está disponível ou em processo
    const animalRes = await client.query(
      'SELECT id_animal, status FROM animais WHERE id_animal = $1',
      [id_animal]
    );
    if (animalRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erro: 'Animal não encontrado' });
    }
    const statusAtual = animalRes.rows[0].status.toLowerCase();
    if (statusAtual === 'adotado') {
      await client.query('ROLLBACK');
      return res.status(400).json({ erro: 'Animal já foi adotado' });
    }

    // Cria o registro de adoção
    const result = await client.query(
      `INSERT INTO adocoes (id_usuario, id_animal, data_adocao)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [id_usuario, id_animal]
    );

    // Marca animal como adotado
    await client.query(
      "UPDATE animais SET status = 'adotado' WHERE id_animal = $1",
      [id_animal]
    );

    // Aprova SOMENTE a solicitação do adotante; rejeita as demais pendentes
    await client.query(
      `UPDATE solicitacoes
       SET status = 'aprovada'
       WHERE id_animal = $1
         AND id_usuario = $2
         AND LOWER(status) = 'pendente'`,
      [id_animal, id_usuario]
    );
    await client.query(
      `UPDATE solicitacoes
       SET status = 'rejeitada'
       WHERE id_animal = $1
         AND id_usuario != $2
         AND LOWER(status) = 'pendente'`,
      [id_animal, id_usuario]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
});

// PUT /adocoes/:id — corrigido: $4 para status (era $3 duplicado)
router.put('/:id', autenticado, async (req, res) => {
  try {
    const id = req.params.id;
    const { id_animal, id_usuario, status } = req.body;

    const result = await db.query(
      `UPDATE adocoes
       SET id_animal  = $2,
           id_usuario = $3,
           status     = $4
       WHERE id_adocao = $1
       RETURNING *`,
      [id, id_animal, id_usuario, status]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Adoção não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
