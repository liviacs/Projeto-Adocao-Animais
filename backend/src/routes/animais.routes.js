const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, param, validationResult } = require('express-validator');

function autenticado(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.status(401).json({ erro: 'Não autenticado. Faça login primeiro.' });
}

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id_animal, nome, especie, raca, idade, sexo, porte, cond_saude, descricao, status FROM animais'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const result = await db.query(
        'SELECT * FROM animais WHERE id_animal = $1',
        [req.params.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ erro: 'Animal não encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
);

router.post(
  '/',
  autenticado,
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório').trim(),
    body('especie').notEmpty().withMessage('Espécie é obrigatória').trim(),
    body('idade').optional().isInt({ min: 0 }).withMessage('Idade inválida'),
    body('sexo').optional().isIn(['M', 'F']).withMessage('Sexo deve ser M ou F'),
    body('porte').optional().isIn(['pequeno', 'medio', 'grande']).withMessage('Porte inválido'),
    body('status').optional().isIn(['disponivel', 'adotado', 'em_processo']).withMessage('Status inválido'),
    body('descricao').optional().trim(),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const { nome, especie, raca, idade, sexo, porte, cond_saude, descricao, status } = req.body;

      const result = await db.query(
        `INSERT INTO animais (nome, especie, raca, idade, sexo, porte, cond_saude, descricao, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [nome, especie, raca || null, idade || null, sexo || null, porte || null,
         cond_saude || null, descricao || null, status || 'disponivel']
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
);

router.put(
  '/:id',
  autenticado,
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    body('nome').optional().notEmpty().withMessage('Nome não pode ser vazio').trim(),
    body('especie').optional().notEmpty().withMessage('Espécie não pode ser vazia').trim(),
    body('sexo').optional().isIn(['M', 'F']).withMessage('Sexo deve ser M ou F'),
    body('porte').optional().isIn(['pequeno', 'medio', 'grande']).withMessage('Porte inválido'),
    body('status').optional().isIn(['disponivel', 'adotado', 'em_processo']).withMessage('Status inválido'),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const { id } = req.params;
      const { nome, especie, raca, idade, sexo, porte, cond_saude, descricao, status } = req.body;

      const result = await db.query(
        `UPDATE animais
         SET nome=$1, especie=$2, raca=$3, idade=$4, sexo=$5, porte=$6,
             cond_saude=$7, descricao=$8, status=$9
         WHERE id_animal=$10
         RETURNING *`,
        [nome, especie, raca, idade, sexo, porte, cond_saude, descricao, status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ erro: 'Animal não encontrado' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
);

router.delete(
  '/:id',
  autenticado,
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const result = await db.query(
        'DELETE FROM animais WHERE id_animal = $1 RETURNING id_animal, nome',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ erro: 'Animal não encontrado' });
      }

      res.json({ mensagem: 'Animal removido com sucesso', animal: result.rows[0] });
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
);

module.exports = router;
