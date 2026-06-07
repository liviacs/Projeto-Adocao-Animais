const express = require('express');
const router = express.Router();
const db = require('../db');

function autenticado(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.status(401).json({ erro: 'Não autenticado. Faça login primeiro.' });
}

router.get('/:tipo', autenticado, async (req, res) => {
  try {
    const { tipo } = req.params;
    let dados = [];
    let titulo = '';

    if (tipo === 'mensal') {
      titulo = 'Relatório Mensal';
      const result = await db.query(`
        SELECT
          TO_CHAR(data_solicitacao, 'YYYY-MM') AS mes,
          COUNT(*) FILTER (WHERE LOWER(status) = 'aprovada') AS adocoes,
          COUNT(*) AS solicitacoes
        FROM solicitacoes
        WHERE data_solicitacao >= NOW() - INTERVAL '6 months'
        GROUP BY mes ORDER BY mes DESC
      `);
      dados = result.rows;
    } else if (tipo === 'especies') {
      titulo = 'Distribuição por Espécie';
      const result = await db.query(`
        SELECT especie, COUNT(*) AS total FROM animais GROUP BY especie ORDER BY total DESC
      `);
      dados = result.rows;
    } else if (tipo === 'adocoes') {
      titulo = 'Histórico de Adoções';
      const result = await db.query(`
        SELECT
          s.data_solicitacao AS data,
          u.nome AS adotante,
          u.email,
          a.nome AS animal,
          a.especie
        FROM solicitacoes s
        JOIN usuarios u ON u.id_usuario = s.id_usuario
        JOIN animais a ON a.id_animal = s.id_animal
        WHERE LOWER(s.status) = 'aprovada'
        ORDER BY s.data_solicitacao DESC
        LIMIT 100
      `);
      dados = result.rows;
    } else {
      return res.status(400).json({ erro: 'Tipo de relatório inválido' });
    }

    const linhas = dados.map(row => Object.values(row).join(',')).join('\n');
    const cabecalho = dados.length > 0 ? Object.keys(dados[0]).join(',') : '';
    const csv = `${cabecalho}\n${linhas}`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-${tipo}.csv"`);
    res.send('\uFEFF' + csv);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
