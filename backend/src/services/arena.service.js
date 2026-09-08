/**
 * Camada de Servicos — Arenas e quadras (RF-003).
 *
 * Orquestra a consulta de arenas e das quadras de cada arena. Todo dado vem do
 * banco atraves dos repositories; nao ha dado fixo aqui.
 */
const AppError = require('../utils/AppError');
const arenaRepository = require('../repositories/arena.repository');
const quadraRepository = require('../repositories/quadra.repository');

/** RF-003 — Lista arenas, com filtros opcionais por regiao e cidade. */
function listar({ regiao, cidade } = {}) {
  return arenaRepository.listar({ regiao, cidade });
}

/** RF-003 — Detalhe de uma arena, com a quantidade de quadras. */
function buscarPorId(id) {
  const arena = arenaRepository.buscarPorId(id);
  if (!arena) {
    throw new AppError('Arena nao encontrada.', 404);
  }

  const quadras = quadraRepository.listarPorArena(id);
  return { ...arena, total_quadras: quadras.length };
}

/** RF-003 — Quadras de uma arena. */
function listarQuadras(arenaId) {
  const arena = arenaRepository.buscarPorId(arenaId);
  if (!arena) {
    throw new AppError('Arena nao encontrada.', 404);
  }

  return quadraRepository.listarPorArena(arenaId);
}

module.exports = { listar, buscarPorId, listarQuadras };
