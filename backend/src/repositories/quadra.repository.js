/**
 * Camada de Persistencia — tabela `quadra`.
 *
 * `horarios_disponiveis` e persistido como JSON serializado e devolvido
 * ja convertido em array para as camadas superiores.
 */
const db = require('../database/connection');

function hidratar(linha) {
  if (!linha) return linha;
  let horarios = [];
  try {
    horarios = JSON.parse(linha.horarios_disponiveis || '[]');
  } catch (e) {
    horarios = [];
  }
  return { ...linha, horarios_disponiveis: horarios };
}

/** Insere uma quadra. `horarios_disponiveis` recebe um array de strings. */
function criar({ id, arena_id, tipo_esporte, horarios_disponiveis = [] }) {
  db.prepare(
    `INSERT INTO quadra (id, arena_id, tipo_esporte, horarios_disponiveis)
     VALUES (@id, @arena_id, @tipo_esporte, @horarios_disponiveis)`
  ).run({
    id,
    arena_id,
    tipo_esporte,
    horarios_disponiveis: JSON.stringify(horarios_disponiveis),
  });

  return buscarPorId(id);
}

/** Busca uma quadra pelo id. */
function buscarPorId(id) {
  return hidratar(db.prepare(`SELECT * FROM quadra WHERE id = ?`).get(id));
}

/** Lista as quadras de uma arena. */
function listarPorArena(arenaId) {
  return db
    .prepare(`SELECT * FROM quadra WHERE arena_id = ? ORDER BY tipo_esporte`)
    .all(arenaId)
    .map(hidratar);
}

/** Lista todas as quadras. */
function listar() {
  return db.prepare(`SELECT * FROM quadra`).all().map(hidratar);
}

/** Remove todas as quadras (usado pelo seed idempotente). */
function limpar() {
  db.prepare(`DELETE FROM quadra`).run();
}

module.exports = { criar, buscarPorId, listarPorArena, listar, limpar };
