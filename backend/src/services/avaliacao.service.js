/**
 * Camada de Servicos — Avaliacoes.
 *
 * Insere a avaliacao e recalcula a `avaliacao_media` da arena
 * (MUITO_BOM=4, BOM=3, MEDIO=2, RUIM=1).
 */
const { uuid, agoraISO } = require('../utils/uuid');
const avaliacaoRepository = require('../repositories/avaliacao.repository');
const arenaRepository = require('../repositories/arena.repository');
const notificacaoService = require('./notificacao.service');

/** Registra a avaliacao e devolve a arena com a media atualizada. */
function criar({ usuario_id, arena_id, nota }) {
  const avaliacao = avaliacaoRepository.criar({
    id: uuid(),
    usuario_id,
    arena_id,
    nota: String(nota).toUpperCase(),
    criado_em: agoraISO(),
  });

  const media = avaliacaoRepository.calcularMediaPorArena(arena_id);
  const arena = arenaRepository.atualizarMedia(
    arena_id,
    Number(media.toFixed(2))
  );

  notificacaoService.notificar(
    usuario_id,
    `Avaliacao registrada para a arena ${arena.nome}.`
  );

  return { avaliacao, arena };
}

/** Lista as avaliacoes de uma arena. */
function listarPorArena(arenaId) {
  return avaliacaoRepository.listarPorArena(arenaId);
}

module.exports = { criar, listarPorArena };
