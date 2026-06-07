const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const client = process.env.DATABASE_URL
  ? new Client({ connectionString: process.env.DATABASE_URL })
  : new Client({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

async function runMigrations() {
  await client.connect();
  console.log('Conectado ao banco de dados.');

  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const migrationsDir = path.resolve(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  if (files.length === 0) {
    console.log('Nenhuma migration encontrada.');
    await client.end();
    return;
  }

  for (const file of files) {
    const { rows } = await client.query(
      'SELECT id FROM migrations WHERE filename = $1', [file]
    );

    if (rows.length > 0) {
      console.log(`Já executada: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`Executada: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Erro ao executar ${file}:`, err.message);
      await client.end();
      process.exit(1);
    }
  }

  console.log('Migrations concluídas!');
  await client.end();
}

runMigrations();
