const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');

//Todos as adoções
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        a.id_animal,
        a.nome,
        a.especie,
        a.raca,
        a.idade,
        a.sexo,
        a.porte,
        a.cond_saude,
        a.descricao,
        a.status,
        u.nome,               
        u.email,
        u.telefone,
        ad.id_adocao
    FROM
        animais                     AS a
        INNER JOIN adocoes          AS ad   ON a.id_animal = ad.id_animal
        INNER JOIN usuarios        AS u    ON ad.id_usuario = u.id_usuario
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

//Busca adoção por ID
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query(
      `SELECT
        a.id_animal,
        a.nome,                
        a.especie,
        a.raca,
        a.idade,
        a.sexo,
        a.porte,
        a.cond_saude,
        a.descricao,
        a.status,
        u.id_usuario,
        u.nome,             
        u.email,
        u.telefone,
        ad.data_adocao
      FROM
        adocoes ad
        LEFT JOIN animais a ON a.id_animal = ad.id_animal
        LEFT JOIN usuarios u ON u.id_usuario = ad.id_usuario
      WHERE ad.id_adocao = $1`,
      [id]
    );
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: 'Adoção não encontrada', id: id });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

//Criar adoção
router.post('/', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { id_usuario, id_animal } = req.body;
    const data = moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS');
    const result = await client.query(
      `INSERT INTO adocoes (id_usuario, id_animal, data_adocao)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id_usuario, id_animal, data]
    );
    await client.query(
      `UPDATE animais
       SET status = 'ADOTADO'
       WHERE id_animal = $1`,
      [id_animal]
    );
    await client.query(
      `UPDATE solicitacoes
       SET status = 'APROVADA'
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

//Atualizar adocao
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {id_adocao, id_animal, id_usuario, status} = req.body;
    const result = await db.query(
      `UPDATE adocoes
       SET id_animal=$2, id_usuario=$3, status=$3
       WHERE id_adocao=$1
       RETURNING *`,
      [id_adocao, id_animal, id_usuario, status]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;