const express = require('express');
const router = express.Router();
const db = require('../db');
const { verificarToken, verificarAdmin } = require('../auth');
const multer = require('multer');

// calcula idade em anos a partir da data de nascimento
function calcularIdade(dataNascimento) {
  if (!dataNascimento) return 0;
  const nasc = new Date(dataNascimento);
  const hoje = new Date();
  let anos = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) anos--;
  return anos < 0 ? 0 : anos;
}
const path = require('path');

// configura onde e como salvar as fotos
const armazenamento = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../database/fotos'));
  },
  filename: (req, file, cb) => {
    // nome único: timestamp + extensão original
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage: armazenamento });

//Todos os animais
router.get('/', verificarToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.id_animal, a.nome, a.especie, a.raca, a.idade, a.data_nascimento, a.sexo, a.porte, a.cond_saude, a.descricao, a.status, a.castrado, a.chipado, a.data_cadastro, a.qtd_adocoes, f.caminho_foto, f.id_foto
      FROM animais a
      LEFT JOIN fotos_animais f ON a.id_animal = f.id_animal`,
    );
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
      `SELECT a.id_animal, a.nome, a.especie, a.raca, a.idade, a.data_nascimento, a.sexo, a.porte, a.cond_saude, a.descricao, a.status, a.castrado, a.chipado, a.data_cadastro, a.qtd_adocoes, f.caminho_foto, f.id_foto
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

router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { nome, especie, raca, sexo, porte, cond_saude, descricao, status, castrado, chipado, data_nascimento } = req.body;
    const idade = calcularIdade(data_nascimento);
    const result = await db.query(
      `INSERT INTO animais (nome, especie, raca, idade, data_nascimento, sexo, porte, cond_saude, descricao, status, castrado, chipado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [nome, especie, raca, idade, data_nascimento || null, sexo, porte || null, cond_saude || null, descricao, status || 'DISPONIVEL', castrado || false, chipado || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

//Atualizar animal
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const {nome, especie, raca, sexo, porte, cond_saude, descricao, status, castrado, chipado, data_nascimento} = req.body;
    const idade = calcularIdade(data_nascimento);
    const result = await db.query(
      `UPDATE animais
       SET nome=$1, especie=$2, raca=$3, idade=$4, data_nascimento=$5, sexo=$6, porte=$7,
           cond_saude=$8, descricao=$9, status=$10, castrado=$11, chipado=$12
       WHERE id_animal=$13
       RETURNING *`,
      [nome, especie, raca, idade, data_nascimento || null, sexo, porte, cond_saude, descricao, status, castrado || false, chipado || false, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Upload de foto de um animal
router.post('/:id/fotos', upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhuma foto enviada' });
    }
    // grava só o nome do arquivo (as fotos são servidas em /img/<nome>)
    const result = await db.query(
      `INSERT INTO fotos_animais (id_animal, caminho_foto) VALUES ($1, $2) RETURNING *`,
      [id, req.file.filename]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;