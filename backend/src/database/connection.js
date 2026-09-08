/**
 * Camada de Persistencia — conexao unica com o SQLite.
 *
 * Todo acesso a dados do sistema passa por este handle, que e importado
 * exclusivamente pelos arquivos de `repositories/`.
 */
const Database = require('better-sqlite3');
const env = require('../config/env');

const db = new Database(env.DB_PATH);

// Integridade referencial precisa ser ligada explicitamente no SQLite.
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

module.exports = db;
