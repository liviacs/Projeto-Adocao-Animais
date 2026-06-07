const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, param, validationResult } = require('express-validator');

function autenticado(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.status(401).json({ erro: 'Não autenticado. Faça login primeiro.' });
}

function formatarAnimal(row) {
  return {
    id: String(row.id_animal),
    nome: row.nome,
    especie: row.especie,
    raca: row.raca || '',
    idade: row.idade || 0,
    unidadeIdade: 'anos',
    sexo: row.sexo ? row.sexo.toLowerCase() : 'macho',
    status: row.status ? row.status.toLowerCase() : 'disponivel',
    descricao: row.descricao || '',
    fotos: row.fotos || [],
    vacinado: false,
    castrado: false,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };
}

router.get('/', async (req, res) => {
  try {
    const { pagina = 1, porPagina = 12, busca, status, especie } = req.query;
    const offset = (Number(pagina) - 1) * Number(porPagina);
    const params = [];
    const condicoes = [];

    if (busca) {
      params.push(`%${busca}%`);
      condicoes.push(`(a.nome ILIKE $${params.length} OR a.raca ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status.toUpperCase());
      condicoes.push(`UPPER(a.status) = $${params.length}`);
    }
    if (especie) {
      params.push(especie);
      condicoes.push(`LOWER(a.especie) = $${params.length}`);
    }

    const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';

    const countResult = await db.query(
      `SELECT COUNT(*) FROM animais a ${where}`, params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(Number(porPagina), offset);
    const result = await db.query(
      `SELECT a.*,
        COALESCE(json_agg(f.caminho_foto) FILTER (WHERE f.id_foto IS NOT NULL), '[]') AS fotos
       FROM animais a
       LEFT JOIN fotos_animais f ON f.id_animal = a.id_animal
       ${where}
       GROUP BY a.id_animal
       ORDER BY a.id_animal DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      dados: result.rows.map(formatarAnimal),
      total,
      pagina: Number(pagina),
      porPagina: Number(porPagina),
      totalPaginas: Math.ceil(total / Number(porPagina)),
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get('/:id', [param('id').isInt({ min: 1 }).withMessage('ID inválido')], async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  try {
    const result = await db.query(
      `SELECT a.*,
        COALESCE(json_agg(f.caminho_foto) FILTER (WHERE f.id_foto IS NOT NULL), '[]') AS fotos
       FROM animais a
       LEFT JOIN fotos_animais f ON f.id_animal = a.id_animal
       WHERE a.id_animal = $1
       GROUP BY a.id_animal`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Animal não encontrado' });
    res.json(formatarAnimal(result.rows[0]));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.post('/', autenticado, [
  body('nome').notEmpty().withMessage('Nome é obrigatório').trim(),
  body('especie').notEmpty().withMessage('Espécie é obrigatória').trim(),
  body('idade').optional().isInt({ min: 0 }).withMessage('Idade inválida'),
  body('sexo').optional().isIn(['macho', 'femea', 'M', 'F']).withMessage('Sexo inválido'),
  body('porte').optional().isIn(['pequeno', 'medio', 'grande']).withMessage('Porte inválido'),
  body('status').optional().isIn(['disponivel', 'adotado', 'em_processo']).withMessage('Status inválido'),
  body('descricao').optional().trim(),
], async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  try {
    const { nome, especie, raca, idade, sexo, porte, descricao, status } = req.body;
    const statusDB = (status || 'disponivel').toUpperCase();
    const sexoDB = sexo ? sexo.toUpperCase().charAt(0) : null;

    const result = await db.query(
      `INSERT INTO animais (nome, especie, raca, idade, sexo, porte, descricao, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [nome, especie, raca || null, idade || null, sexoDB, porte || null, descricao || null, statusDB]
    );
    res.status(201).json(formatarAnimal({ ...result.rows[0], fotos: [] }));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.patch('/:id', autenticado, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  body('nome').optional().notEmpty().trim(),
  body('sexo').optional().isIn(['macho', 'femea', 'M', 'F']).withMessage('Sexo inválido'),
  body('porte').optional().isIn(['pequeno', 'medio', 'grande']).withMessage('Porte inválido'),
  body('status').optional().isIn(['disponivel', 'adotado', 'em_processo']).withMessage('Status inválido'),
], async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  try {
    const { id } = req.params;
    const atual = await db.query('SELECT * FROM animais WHERE id_animal = $1', [id]);
    if (atual.rows.length === 0) return res.status(404).json({ erro: 'Animal não encontrado' });

    const a = atual.rows[0];
    const { nome, especie, raca, idade, sexo, porte, descricao, status } = req.body;
    const statusDB = status ? status.toUpperCase() : a.status;
    const sexoDB = sexo ? sexo.toUpperCase().charAt(0) : a.sexo;

    const result = await db.query(
      `UPDATE animais
       SET nome=$1, especie=$2, raca=$3, idade=$4, sexo=$5, porte=$6, descricao=$7, status=$8
       WHERE id_animal=$9 RETURNING *`,
      [nome ?? a.nome, especie ?? a.especie, raca ?? a.raca, idade ?? a.idade,
       sexoDB, porte ?? a.porte, descricao ?? a.descricao, statusDB, id]
    );
    res.json(formatarAnimal({ ...result.rows[0], fotos: [] }));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.delete('/:id', autenticado, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
], async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  try {
    const result = await db.query(
      'DELETE FROM animais WHERE id_animal = $1 RETURNING id_animal, nome',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Animal não encontrado' });
    res.json({ mensagem: 'Animal removido com sucesso', animal: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
