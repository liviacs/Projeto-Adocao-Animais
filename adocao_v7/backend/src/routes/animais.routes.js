const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, param, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Upload config ─────────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `foto-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
  },
});

// ── Auth helper ────────────────────────────────────────────────────────────────
function autenticado(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.status(401).json({ erro: 'Não autenticado. Faça login primeiro.' });
}

// ── Format helper ──────────────────────────────────────────────────────────────
function formatarAnimal(row) {
  return {
    id:           String(row.id_animal),
    nome:         row.nome,
    especie:      row.especie,
    raca:         row.raca        || '',
    idade:        row.idade       || 0,
    unidadeIdade: row.unidade_idade || 'anos',
    sexo:         row.sexo        ? row.sexo.toLowerCase()   : 'macho',
    status:       row.status      ? row.status.toLowerCase() : 'disponivel',
    descricao:    row.descricao   || '',
    fotos:        row.fotos       || [],
    peso:         row.peso        || null,
    vacinado:     row.vacinado    || false,
    castrado:     row.castrado    || false,
    criadoEm:     row.data_cadastro || new Date().toISOString(),
    atualizadoEm: row.data_atualizacao || row.data_cadastro || new Date().toISOString(),
  };
}

// ── GET /animais ───────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { pagina = 1, porPagina = 12, busca, status, especie } = req.query;
    const pg = Math.max(1, Number(pagina));
    const pp = Math.min(100, Math.max(1, Number(porPagina)));
    const offset = (pg - 1) * pp;
    const params = [];
    const condicoes = [];

    if (busca) {
      params.push(`%${busca}%`);
      condicoes.push(`(a.nome ILIKE $${params.length} OR a.raca ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status.toLowerCase());
      condicoes.push(`LOWER(a.status) = $${params.length}`);
    }
    if (especie) {
      params.push(especie.toLowerCase());
      condicoes.push(`LOWER(a.especie) = $${params.length}`);
    }

    const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';

    const countResult = await db.query(`SELECT COUNT(*) FROM animais a ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(pp, offset);
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
      dados:        result.rows.map(formatarAnimal),
      total,
      pagina:       pg,
      porPagina:    pp,
      totalPaginas: Math.ceil(total / pp),
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── GET /animais/:id ───────────────────────────────────────────────────────────
router.get('/:id',
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  async (req, res) => {
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
  }
);

// ── POST /animais ──────────────────────────────────────────────────────────────
router.post('/',
  autenticado,
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório').trim(),
    body('especie').notEmpty().withMessage('Espécie é obrigatória').trim(),
    body('idade').optional().isInt({ min: 0 }).withMessage('Idade inválida'),
    body('sexo').optional().isIn(['macho', 'femea']).withMessage('Sexo deve ser macho ou femea'),
    body('porte').optional().isIn(['pequeno', 'medio', 'grande']).withMessage('Porte inválido'),
    body('status').optional().isIn(['disponivel', 'adotado', 'em_processo']).withMessage('Status inválido'),
    body('descricao').optional().trim(),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const { nome, especie, raca, idade, unidadeIdade, sexo, porte, descricao, status, peso, vacinado, castrado } = req.body;

      const result = await db.query(
        `INSERT INTO animais (nome, especie, raca, idade, unidade_idade, sexo, porte, descricao, status, peso, vacinado, castrado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          nome, especie, raca || null, idade || null,
          unidadeIdade || 'anos', sexo || null, porte || null,
          descricao || null, status || 'disponivel',
          peso || null, vacinado || false, castrado || false,
        ]
      );
      res.status(201).json(formatarAnimal({ ...result.rows[0], fotos: [] }));
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
);

// ── PATCH /animais/:id ─────────────────────────────────────────────────────────
router.patch('/:id',
  autenticado,
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    body('nome').optional().notEmpty().withMessage('Nome não pode ser vazio').trim(),
    body('sexo').optional().isIn(['macho', 'femea']).withMessage('Sexo deve ser macho ou femea'),
    body('porte').optional().isIn(['pequeno', 'medio', 'grande']).withMessage('Porte inválido'),
    body('status').optional().isIn(['disponivel', 'adotado', 'em_processo']).withMessage('Status inválido'),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const { id } = req.params;
      const atual = await db.query('SELECT * FROM animais WHERE id_animal = $1', [id]);
      if (atual.rows.length === 0) return res.status(404).json({ erro: 'Animal não encontrado' });

      const a = atual.rows[0];
      const { nome, especie, raca, idade, unidadeIdade, sexo, porte, descricao, status, peso, vacinado, castrado } = req.body;

      const result = await db.query(
        `UPDATE animais
         SET nome=$1, especie=$2, raca=$3, idade=$4, unidade_idade=$5,
             sexo=$6, porte=$7, descricao=$8, status=$9, peso=$10,
             vacinado=$11, castrado=$12, data_atualizacao=NOW()
         WHERE id_animal=$13
         RETURNING *`,
        [
          nome             ?? a.nome,
          especie          ?? a.especie,
          raca             ?? a.raca,
          idade            ?? a.idade,
          unidadeIdade     ?? a.unidade_idade ?? 'anos',
          sexo             ?? a.sexo,
          porte            ?? a.porte,
          descricao        ?? a.descricao,
          status           ?? a.status,
          peso             ?? a.peso,
          vacinado         ?? a.vacinado,
          castrado         ?? a.castrado,
          id,
        ]
      );

      // Busca fotos atualizadas
      const fotosRes = await db.query('SELECT caminho_foto FROM fotos_animais WHERE id_animal = $1', [id]);
      const fotos = fotosRes.rows.map(r => r.caminho_foto);
      res.json(formatarAnimal({ ...result.rows[0], fotos }));
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
);

// ── DELETE /animais/:id ────────────────────────────────────────────────────────
router.delete('/:id',
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
      if (result.rows.length === 0) return res.status(404).json({ erro: 'Animal não encontrado' });
      res.json({ mensagem: 'Animal removido com sucesso', animal: result.rows[0] });
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
);

// ── POST /animais/:id/fotos — upload real com multer ──────────────────────────
router.post('/:id/fotos',
  autenticado,
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  upload.single('foto'),
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });

    try {
      const { id } = req.params;
      const animal = await db.query('SELECT id_animal FROM animais WHERE id_animal = $1', [id]);
      if (animal.rows.length === 0) return res.status(404).json({ erro: 'Animal não encontrado' });

      // Caminho público acessível pelo frontend
      const caminhoFoto = `/uploads/${req.file.filename}`;

      await db.query(
        'INSERT INTO fotos_animais (id_animal, caminho_foto) VALUES ($1, $2)',
        [id, caminhoFoto]
      );

      res.status(201).json({ mensagem: 'Foto enviada com sucesso', caminho: caminhoFoto });
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
);

module.exports = router;
