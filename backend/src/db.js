const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host:     process.env.DB_HOST,
      port:     Number(process.env.DB_PORT) || 5432,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do banco de dados:', err.message);
});

module.exports = pool;