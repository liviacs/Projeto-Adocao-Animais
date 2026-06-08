const { getToken } = require('next-auth/jwt');

// Segredo do NextAuth — deve ser o mesmo do NEXTAUTH_SECRET no frontend
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'nextauth-secret-padrao-troque-em-producao';

/**
 * Middleware que aceita autenticação de duas formas:
 * 1. Sessão HTTP (express-session) — fluxo legado
 * 2. Header x-nextauth-token com o JWT do NextAuth — fluxo principal
 */
async function autenticado(req, res, next) {
  // ── Forma 1: sessão HTTP (login direto pelo backend) ──────────────────────
  if (req.session && req.session.usuario) {
    return next();
  }

  // ── Forma 2: token JWT enviado no header pelo frontend ────────────────────
  const tokenHeader = req.headers['x-nextauth-token'];
  if (tokenHeader) {
    try {
      // next-auth/jwt consegue verificar o token mesmo fora do Next.js
      const payload = await getToken({
        req: { headers: { cookie: `next-auth.session-token=${tokenHeader}` } },
        secret: NEXTAUTH_SECRET,
        raw: false,
      });

      if (payload) {
        // Reconstrói o objeto de usuário no mesmo formato da sessão HTTP
        req.session.usuario = {
          id:    payload.sub,
          nome:  payload.name,
          email: payload.email,
          tipo:  payload.tipo || 'adotante',
        };
        return next();
      }
    } catch {
      // token inválido — cai no 401 abaixo
    }
  }

  // ── Forma 3: header simples x-user-email (fallback de desenvolvimento) ────
  const emailHeader = req.headers['x-user-email'];
  if (emailHeader) {
    try {
      const { Pool } = require('pg');
      const db = require('../db');
      const result = await db.query(
        'SELECT id_usuario, nome, email, tipo FROM usuarios WHERE email = $1',
        [emailHeader]
      );
      if (result.rows.length > 0) {
        const u = result.rows[0];
        req.session.usuario = {
          id:    u.id_usuario,
          nome:  u.nome,
          email: u.email,
          tipo:  u.tipo,
        };
        return next();
      }
    } catch {
      // banco indisponível — cai no 401
    }
  }

  return res.status(401).json({ erro: 'Não autenticado. Faça login primeiro.' });
}

/**
 * Middleware de autorização — exige perfil admin
 */
function apenasAdmin(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ erro: 'Não autenticado.' });
  }
  if (req.session.usuario.tipo !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado. Apenas administradores.' });
  }
  return next();
}

module.exports = { autenticado, apenasAdmin };
