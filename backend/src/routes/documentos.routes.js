const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const { verificarToken, verificarAdmin } = require('../auth');

// multer em memória — o arquivo vira buffer, gravado direto no BYTEA
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por arquivo
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Apenas arquivos PDF são aceitos'));
  },
});

// Enviar/atualizar os 3 documentos do usuário (a própria pessoa)
// espera 3 arquivos: rg, cpf_documento, comprovante_residencia
router.put('/usuario/:idUsuario', verificarToken, upload.fields([
  { name: 'documento_identidade', maxCount: 1 },
  { name: 'comprovante_residencia', maxCount: 1 },
]), async (req, res) => {
  try {
    const { idUsuario } = req.params;

    if (req.usuario.tipo !== 'ADMIN' && String(req.usuario.sub) !== String(idUsuario)) {
      return res.status(403).json({ erro: 'Você só pode enviar seus próprios documentos' });
    }

    const identidade = req.files?.documento_identidade?.[0]?.buffer;
    const comprovante = req.files?.comprovante_residencia?.[0]?.buffer;

    const existente = await db.query(
      'SELECT id_documento_usuario FROM documentos_usuario WHERE id_usuario = $1',
      [idUsuario]
    );

    if (existente.rows.length === 0) {
      if (!identidade || !comprovante) {
        return res.status(400).json({ erro: 'No primeiro envio, anexe os 2 documentos: identidade e comprovante de residência' });
      }
      await db.query(
        `INSERT INTO documentos_usuario (id_usuario, documento_identidade, comprovante_residencia)
         VALUES ($1, $2, $3)`,
        [idUsuario, identidade, comprovante]
      );
    } else {
      if (!identidade && !comprovante) {
        return res.status(400).json({ erro: 'Envie ao menos um documento para atualizar' });
      }
      await db.query(
        `UPDATE documentos_usuario SET
           documento_identidade = COALESCE($2, documento_identidade),
           comprovante_residencia = COALESCE($3, comprovante_residencia)
         WHERE id_usuario = $1`,
        [idUsuario, identidade ?? null, comprovante ?? null]
      );
    }

    res.json({ mensagem: 'Documentos enviados com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Verificar se o usuário tem documentos (sem baixar o binário — só status)
router.get('/usuario/:idUsuario/status', verificarToken, async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const result = await db.query(
      'SELECT id_documento_usuario FROM documentos_usuario WHERE id_usuario = $1',
      [idUsuario]
    );
    res.json({ temDocumentos: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Baixar um documento específico (PDF) — dono ou admin
router.get('/usuario/:idUsuario/:tipo', verificarToken, async (req, res) => {
  try {
    const { idUsuario, tipo } = req.params;
    // só dono ou admin
    if (req.usuario.tipo !== 'ADMIN' && String(req.usuario.sub) !== String(idUsuario)) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    // valida o tipo pra evitar SQL injection na coluna
    const colunas = { identidade: 'documento_identidade', comprovante: 'comprovante_residencia' };
    const coluna = colunas[tipo];
    if (!coluna) return res.status(400).json({ erro: 'Tipo de documento inválido' });

    const result = await db.query(
      `SELECT ${coluna} AS doc FROM documentos_usuario WHERE id_usuario = $1`,
      [idUsuario]
    );
    if (!result.rows[0]?.doc) return res.status(404).json({ erro: 'Documento não encontrado' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${tipo}.pdf"`);
    res.send(result.rows[0].doc);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Documentos do pet (só admin) ──────────────────────────────────────────────
// Enviar/atualizar documentos do pet (todos opcionais)
router.put('/pet/:idAnimal', verificarToken, verificarAdmin, upload.fields([
  { name: 'certidao_nascimento', maxCount: 1 },
  { name: 'certidao_obito', maxCount: 1 },
  { name: 'rga', maxCount: 1 },
  { name: 'carteira_vacinacao', maxCount: 1 },
]), async (req, res) => {
  try {
    const { idAnimal } = req.params;
    const nasc = req.files?.certidao_nascimento?.[0]?.buffer;
    const obito = req.files?.certidao_obito?.[0]?.buffer;
    const rga = req.files?.rga?.[0]?.buffer;
    const carteira = req.files?.carteira_vacinacao?.[0]?.buffer;

    const existente = await db.query(
      'SELECT id_documento_pet FROM documentos_pet WHERE id_animal = $1',
      [idAnimal]
    );

    if (existente.rows.length === 0) {
      // tudo opcional — insere o que vier (resto null)
      await db.query(
        `INSERT INTO documentos_pet (id_animal, certidao_nascimento, certidao_obito, rga, carteira_vacinacao)
         VALUES ($1, $2, $3, $4, $5)`,
        [idAnimal, nasc ?? null, obito ?? null, rga ?? null, carteira ?? null]
      );
    } else {
      // atualiza só os que vieram (COALESCE mantém os atuais)
      await db.query(
        `UPDATE documentos_pet SET
           certidao_nascimento = COALESCE($2, certidao_nascimento),
           certidao_obito = COALESCE($3, certidao_obito),
           rga = COALESCE($4, rga),
           carteira_vacinacao = COALESCE($5, carteira_vacinacao)
         WHERE id_animal = $1`,
        [idAnimal, nasc ?? null, obito ?? null, rga ?? null, carteira ?? null]
      );
    }
    res.json({ mensagem: 'Documentos do pet salvos com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Status: quais documentos o pet tem (só admin)
router.get('/pet/:idAnimal/status', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { idAnimal } = req.params;
    const result = await db.query(
      `SELECT
         (certidao_nascimento IS NOT NULL) AS tem_nascimento,
         (certidao_obito IS NOT NULL) AS tem_obito,
         (rga IS NOT NULL) AS tem_rga,
         (carteira_vacinacao IS NOT NULL) AS tem_carteira
       FROM documentos_pet WHERE id_animal = $1`,
      [idAnimal]
    );
    res.json(result.rows[0] ?? { tem_nascimento: false, tem_obito: false, tem_rga: false, tem_carteira: false });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Baixar um documento do pet (só admin)
router.get('/pet/:idAnimal/:tipo', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { idAnimal, tipo } = req.params;
    const colunas = {
      nascimento: 'certidao_nascimento',
      obito: 'certidao_obito',
      rga: 'rga',
      carteira: 'carteira_vacinacao',
    };
    const coluna = colunas[tipo];
    if (!coluna) return res.status(400).json({ erro: 'Tipo de documento inválido' });

    const result = await db.query(
      `SELECT ${coluna} AS doc FROM documentos_pet WHERE id_animal = $1`,
      [idAnimal]
    );
    if (!result.rows[0]?.doc) return res.status(404).json({ erro: 'Documento não encontrado' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${tipo}.pdf"`);
    res.send(result.rows[0].doc);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;