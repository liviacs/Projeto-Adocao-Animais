const express = require('express');
const router = express.Router();
const db = require('../db');

function autenticado(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.status(401).json({ erro: 'Não autenticado. Faça login primeiro.' });
}

router.get('/estatisticas', autenticado, async (req, res) => {
  try {
    const [animaisResult, usuariosResult, solicitacoesResult] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*)                                                       AS "totalAnimais",
          COUNT(*) FILTER (WHERE LOWER(status) = 'disponivel')          AS disponiveis,
          COUNT(*) FILTER (WHERE LOWER(status) = 'em_processo')         AS "emProcesso",
          COUNT(*) FILTER (WHERE LOWER(status) = 'adotado')             AS adotados
        FROM animais
      `),
      db.query(`SELECT COUNT(*) AS "totalUsuarios" FROM usuarios`),
      db.query(`
        SELECT
          COUNT(*) FILTER (WHERE LOWER(status) = 'pendente')            AS "solicitacoesPendentes",
          COUNT(*) FILTER (
            WHERE LOWER(status) = 'aprovada'
            AND data_solicitacao >= DATE_TRUNC('month', NOW())
          )                                                              AS "adocoesEsteMes"
        FROM solicitacoes
      `),
    ]);

    const a = animaisResult.rows[0];
    const u = usuariosResult.rows[0];
    const s = solicitacoesResult.rows[0];

    res.json({
      totalAnimais:          Number(a.totalAnimais),
      disponiveis:           Number(a.disponiveis),
      emProcesso:            Number(a.emProcesso),
      adotados:              Number(a.adotados),
      totalUsuarios:         Number(u.totalUsuarios),
      solicitacoesPendentes: Number(s.solicitacoesPendentes),
      adocoesEsteMes:        Number(s.adocoesEsteMes),
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
