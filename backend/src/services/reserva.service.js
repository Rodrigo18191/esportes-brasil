/**
 * Camada de Servicos — Reservas (RF-004, RF-007).
 *
 * Recebe dados ja validados pela camada de regras, monta a entidade, persiste
 * via repositorio e dispara a notificacao. Nao contem SQL nem regra de negocio.
 */
const { uuid, agoraISO } = require('../utils/uuid');
const reservaRepository = require('../repositories/reserva.repository');
const quadraRepository = require('../repositories/quadra.repository');
const arenaRepository = require('../repositories/arena.repository');
const notificacaoService = require('./notificacao.service');

/**
 * RF-004 — Cria uma reserva.
 * O `usuario_id` sempre vem do token (camada de apresentacao), nunca do corpo
 * da requisicao.
 */
function criar({ usuario_id, quadra_id, dia_semana, horario, status }) {
  const reserva = reservaRepository.criar({
    id: uuid(),
    usuario_id,
    quadra_id,
    dia_semana,
    horario,
    status: status || 'AGENDADO',
    criado_em: agoraISO(),
  });

  const quadra = quadraRepository.buscarPorId(quadra_id);
  const arena = quadra ? arenaRepository.buscarPorId(quadra.arena_id) : null;

  notificacaoService.notificar(
    usuario_id,
    `Reserva confirmada${arena ? ' na arena ' + arena.nome : ''}: ${dia_semana} as ${horario}.`
  );

  return reserva;
}

/** RF-007 — Reservas do usuario logado, com filtro opcional por status. */
function listarDoUsuario(usuarioId, { status } = {}) {
  return reservaRepository.listarPorUsuario(usuarioId, {
    status: status ? String(status).toUpperCase() : undefined,
  });
}

/** RF-007 — Cancela uma reserva ja validada pela camada de regras. */
function cancelar(reserva) {
  const atualizada = reservaRepository.atualizarStatus(reserva.id, 'CANCELADO');

  notificacaoService.notificar(
    reserva.usuario_id,
    `Reserva de ${reserva.dia_semana} as ${reserva.horario} cancelada.`
  );

  return atualizada;
}

module.exports = { criar, listarDoUsuario, cancelar };
