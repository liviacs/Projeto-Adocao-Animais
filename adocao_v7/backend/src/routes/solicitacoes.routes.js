const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, param, validationResult } = require('express-validator');

function autenticado(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.status(401).json({ erro: 'Não autenticado. Faça login primeiro.' });
}

router.get('/', autenticado, async (req, res) => {
  try {
    const { status, pagina = 1, porPagina = 10 } = req.query;
    const offset = (Number(pagina) - 1) * Number(porPagina);
    const params = [];
    let where = '';

    if (status) {
      params.push(status.toLowerCase());
      where = `WHERE LOWER(s.status) = $${params.length}`;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM solicitacoes s ${where}`, params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(Number(porPagina), offset);
    const result = await db.query(
      `SELECT
         s.id_solicitacao                   AS id,
         LOWER(s.status)                    AS status,
         s.data_solicitacao                 AS "criadaEm",
         s.data_solicitacao                 AS "atualizadaEm",
         s.mensagem,
         json_build_object(
           'id',       u.id_usuario,
           'nome',     u.nome,
           'email',    u.email,
           'perfil',   u.tipo,
           'ativo',    true,
           'criadoEm', u.data_cadastro
         ) AS usuario,
         json_build_object(
           'id',           a.id_animal,
           'nome',         a.nome,
           'raca',         COALESCE(a.raca, ''),
           'especie',      a.especie,
           'idade',        COALESCE(a.idade, 0),
           'unidadeIdade', 'anos',
           'sexo',         LOWER(COALESCE(a.sexo, 'macho')),
           'status',       LOWER(a.status),
           'descricao',    COALESCE(a.descricao, ''),
           'fotos',        COALESCE((
             SELECT json_agg(f.caminho_foto)
             FROM fotos_animais f WHERE f.id_animal = a.id_animal
           ), '[]'::json),
           'vacinado',     false,
           'castrado',     false,
           'criadoEm',     NOW(),
           'atualizadoEm', NOW()
         ) AS animal
       FROM solicitacoes s
       JOIN usuarios u ON u.id_usuario = s.id_usuario
       JOIN animais  a ON a.id_animal  = s.id_animal
       ${where}
       ORDER BY s.data_solicitacao DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      dados:        result.rows,
      total,
      pagina:       Number(pagina),
      porPagina:    Number(porPagina),
      totalPaginas: Math.ceil(total / Number(porPagina)),
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.post('/',
  autenticado,
  [
    body('idAnimal').notEmpty().withMessage('idAnimal é obrigatório'),
    body('mensagem').optional().trim(),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const { idAnimal, mensagem } = req.body;
      const idUsuario = req.session.usuario.id;

      const animal = await db.query(
        'SELECT id_animal, status FROM animais WHERE id_animal = $1', [idAnimal]
      );
      if (animal.rows.length === 0) return res.status(404).json({ erro: 'Animal não encontrado' });
      if (animal.rows[0].status.toLowerCase() !== 'disponivel') {
        return res.status(400).json({ erro: 'Animal não está disponível para adoção' });
      }

      const result = await db.query(
        `INSERT INTO solicitacoes (id_usuario, id_animal, status, mensagem)
         VALUES ($1, $2, 'pendente', $3)
         RETURNING id_solicitacao AS id, status, data_solicitacao AS "criadaEm", mensagem`,
        [idUsuario, idAnimal, mensagem || null]
      );

      await db.query(
        "UPDATE animais SET status = 'em_processo' WHERE id_animal = $1", [idAnimal]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
);

router.post('/:id/aprovar',
  autenticado,
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const solic = await db.query(
        'SELECT * FROM solicitacoes WHERE id_solicitacao = $1', [req.params.id]
      );
      if (solic.rows.length === 0) return res.status(404).json({ erro: 'Solicitação não encontrada' });

      await db.query(
        "UPDATE solicitacoes SET status = 'aprovada' WHERE id_solicitacao = $1", [req.params.id]
      );
      await db.query(
        "UPDATE animais SET status = 'adotado' WHERE id_animal = $1", [solic.rows[0].id_animal]
      );
      await db.query(
        "UPDATE solicitacoes SET status = 'rejeitada' WHERE id_animal = $1 AND id_solicitacao != $2 AND LOWER(status) = 'pendente'",
        [solic.rows[0].id_animal, req.params.id]
      );

      const result = await db.query(
        'SELECT id_solicitacao AS id, status, data_solicitacao AS "criadaEm" FROM solicitacoes WHERE id_solicitacao = $1',
        [req.params.id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
);

router.post('/:id/rejeitar',
  autenticado,
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const solic = await db.query(
        'SELECT * FROM solicitacoes WHERE id_solicitacao = $1', [req.params.id]
      );
      if (solic.rows.length === 0) return res.status(404).json({ erro: 'Solicitação não encontrada' });

      await db.query(
        "UPDATE solicitacoes SET status = 'rejeitada' WHERE id_solicitacao = $1", [req.params.id]
      );

      const pendentes = await db.query(
        "SELECT COUNT(*) FROM solicitacoes WHERE id_animal = $1 AND LOWER(status) = 'pendente'",
        [solic.rows[0].id_animal]
      );
      if (parseInt(pendentes.rows[0].count) === 0) {
        await db.query(
          "UPDATE animais SET status = 'disponivel' WHERE id_animal = $1",
          [solic.rows[0].id_animal]
        );
      }

      const result = await db.query(
        'SELECT id_solicitacao AS id, status, data_solicitacao AS "criadaEm" FROM solicitacoes WHERE id_solicitacao = $1',
        [req.params.id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
);

module.exports = router;
