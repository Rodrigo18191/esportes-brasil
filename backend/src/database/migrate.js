/**
 * Executa o schema.sql, recriando as tabelas do banco.
 * Uso: npm run db:migrate
 */
const fs = require('fs');
const path = require('path');
const db = require('./connection');
const env = require('../config/env');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// As FKs ficam desligadas durante o DROP/CREATE para permitir recriar
// as tabelas em qualquer ordem.
db.pragma('foreign_keys = OFF');
db.exec(schema);
db.pragma('foreign_keys = ON');

console.log('[migrate] Banco criado em: ' + env.DB_PATH);
console.log('[migrate] Tabelas: usuario, arena, quadra, reserva, turma, turma_participante, avaliacao');
