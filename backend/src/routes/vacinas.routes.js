const express = require('express');
const router = express.Router();
const db = require('../db');
const { verificarToken, verificarAdmin } = require('../auth');

// Buscar vacinas de um animal (qualquer logado pode ver)
router.get('/:idAnimal', verificarToken, async (req, res) => {
  try {
    const { idAnimal } = req.params;
    const result = await db.query(
      'SELECT * FROM vacinas WHERE id_animal = $1',
      [idAnimal]
    );
    // retorna a linha ou null (animal pode ainda não ter vacinas)
    res.json(result.rows[0] ?? null);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Criar/atualizar vacinas de um animal (só admin) — upsert via ON CONFLICT
router.put('/:idAnimal', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { idAnimal } = req.params;
    const { antirrabica, v8, v10, giardia, leishmaniose, triplice_felina, quadrupla_felina } = req.body;
    const result = await db.query(
      `INSERT INTO vacinas (id_animal, antirrabica, v8, v10, giardia, leishmaniose, triplice_felina, quadrupla_felina)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id_animal) DO UPDATE SET
         antirrabica = EXCLUDED.antirrabica,
         v8 = EXCLUDED.v8,
         v10 = EXCLUDED.v10,
         giardia = EXCLUDED.giardia,
         leishmaniose = EXCLUDED.leishmaniose,
         triplice_felina = EXCLUDED.triplice_felina,
         quadrupla_felina = EXCLUDED.quadrupla_felina
       RETURNING *`,
      [
        idAnimal,
        antirrabica || null, v8 || null, v10 || null, giardia || null,
        leishmaniose || null, triplice_felina || null, quadrupla_felina || null,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;