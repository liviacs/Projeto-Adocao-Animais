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

module.exports = router;