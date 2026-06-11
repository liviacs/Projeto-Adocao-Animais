// logger.js — helper para inserir logs no banco
const db = require('./db');

/**
 * Insere um log na tabela `logs`.
 * @param {'sucesso'|'info'|'aviso'|'erro'} tipo
 * @param {string} mensagem
 * @param {string} [usuario='sistema']
 * @param {import('pg').PoolClient} [client] — passa um client se estiver dentro de uma transaction
 */
async function log(tipo, mensagem, usuario = 'sistema', client = null) {
  try {
    const conn = client ?? db;
    await conn.query(
      `INSERT INTO logs (tipo, mensagem, usuario) VALUES ($1, $2, $3)`,
      [tipo, mensagem, usuario]
    );
  } catch (err) {
    // log nunca deve derrubar a operação principal
    console.error('[logger] falha ao gravar log:', err.message);
  }
}

module.exports = log;
