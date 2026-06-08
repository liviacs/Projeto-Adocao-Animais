const express = require('express');
const router = express.Router();
const db = require('../db');
const { verificarToken } = require('../auth');

//Todos os animais
router.get('/', verificarToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.id_animal, a.nome, a.especie, a.raca, a.idade, a.sexo, a.porte, a.cond_saude, a.descricao, a.status, f.caminho_foto, f.id_foto
      FROM animais a
      LEFT JOIN fotos_animais f ON a.id_animal = f.id_animal
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

//Busca animal por ID
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    const result = await db.query(
      `SELECT a.id_animal, a.nome, a.especie, a.raca, a.idade, a.sexo, a.porte, a.cond_saude, a.descricao, a.status, f.caminho_foto, f.id_foto
      FROM animais a
      LEFT JOIN fotos_animais f ON a.id_animal = f.id_animal
      WHERE a.id_animal = $1`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

//Criar animal
router.post('/', verificarToken, async (req, res) => {
  try {
    const { nome, especie, idade, descricao } = req.body;

    const result = await db.query(
      `INSERT INTO animais (nome, especie, idade, descricao)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nome, especie, idade, descricao]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

//Atualizar animal
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const {nome, especie, raca, idade, sexo, porte, cond_saude, descricao, status} = req.body;
    const result = await db.query(
      `UPDATE animais
       SET nome=$1, especie=$2, raca=$3, idade=$4, sexo=$5, porte=$6,
           cond_saude=$7, descricao=$8, status=$9
       WHERE id_animal=$10
       RETURNING *`,
      [nome, especie, raca, idade, sexo, porte, cond_saude, descricao, status, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;