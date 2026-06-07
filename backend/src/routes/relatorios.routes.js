const express = require('express');
const router = express.Router();
const db = require('../db');

function autenticado(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.status(401).json({ erro: 'Não autenticado. Faça login primeiro.' });
}

router.get('/:tipo', autenticado, async (req, res) => {
  try {
    const tipo = req.params.tipo;
    let dados = [];

    if (tipo === 'mensal') {
      const result = await db.query(`
        SELECT
          TO_CHAR(data_solicitacao, 'YYYY-MM') AS mes,
          COUNT(*)                                                        AS solicitacoes,
          COUNT(*) FILTER (WHERE LOWER(status) = 'aprovada')             AS adocoes
        FROM solicitacoes
        WHERE data_solicitacao >= NOW() - INTERVAL '6 months'
        GROUP BY mes
        ORDER BY mes DESC
      `);
      dados = result.rows;
    } else if (tipo === 'especies') {
      const result = await db.query(`
        SELECT especie, COUNT(*) AS total
        FROM animais
        GROUP BY especie
        ORDER BY total DESC
      `);
      dados = result.rows;
    } else if (tipo === 'adocoes') {
      const result = await db.query(`
        SELECT
          TO_CHAR(s.data_solicitacao, 'DD/MM/YYYY HH24:MI') AS data,
          u.nome   AS adotante,
          u.email,
          a.nome   AS animal,
          a.especie,
          a.raca
        FROM solicitacoes s
        JOIN usuarios u ON u.id_usuario = s.id_usuario
        JOIN animais  a ON a.id_animal  = s.id_animal
        WHERE LOWER(s.status) = 'aprovada'
        ORDER BY s.data_solicitacao DESC
        LIMIT 500
      `);
      dados = result.rows;
    } else {
      return res.status(400).json({ erro: 'Tipo inválido. Use: mensal, especies ou adocoes' });
    }

    if (dados.length === 0) {
      return res.status(200).json({ mensagem: 'Sem dados para este relatório', dados: [] });
    }

    const cabecalho = Object.keys(dados[0]).join(',');
    const linhas = dados.map(row =>
      Object.values(row).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-${tipo}-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('\uFEFF' + cabecalho + '\n' + linhas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
