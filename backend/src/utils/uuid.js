/**
 * Geracao de identificadores.
 * Todos os `id` do modelo de dados sao UUID armazenados como TEXT.
 */
const crypto = require('crypto');

function uuid() {
  return crypto.randomUUID();
}

/** Data/hora atual em ISO 8601, formato usado nas colunas `criado_em`. */
function agoraISO() {
  return new Date().toISOString();
}

module.exports = { uuid, agoraISO };
