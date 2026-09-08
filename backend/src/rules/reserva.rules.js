/**
 * Camada de Regras de Negocio — Reservas.
 *
 * Funcoes de validacao chamadas pelos controllers ANTES da camada de servicos.
 * Cada funcao consulta os repositories quando precisa checar estado e lanca
 * `AppError` quando a regra e violada.
 */
const AppError = require('../utils/AppError');
const quadraRepository = require('../repositories/quadra.repository');
const reservaRepository = require('../repositories/reserva.repository');

const DIAS_SEMANA = [
  'SEGUNDA',
  'TERCA',
  'QUARTA',
  'QUINTA',
  'SEXTA',
  'SABADO',
  'DOMINGO',
];

/**
 * Validacao de formato dos dados de entrada de uma reserva.
 * Nao e uma RNE: apenas garante que os campos obrigatorios chegaram.
 * Requisitos relacionados: RF-004
 */
function validarDadosReserva({ quadra_id, dia_semana, horario }) {
  if (!quadra_id || String(quadra_id).trim() === '') {
    throw new AppError('O campo "quadra_id" e obrigatorio.', 400);
  }
  if (!dia_semana || String(dia_semana).trim() === '') {
    throw new AppError('O campo "dia_semana" e obrigatorio.', 400);
  }
  if (!horario || String(horario).trim() === '') {
    throw new AppError('O campo "horario" e obrigatorio.', 400);
  }
  if (!DIAS_SEMANA.includes(String(dia_semana).toUpperCase())) {
    throw new AppError(
      `Dia da semana invalido. Valores aceitos: ${DIAS_SEMANA.join(', ')}.`,
      400
    );
  }
}

/**
 * RNE-002 — Cada quadra possui horarios definidos pelo administrador, e apenas
 * horarios disponiveis podem ser reservados.
 *
 * Duas verificacoes:
 *   1. O horario solicitado precisa constar em `horarios_disponiveis` da quadra.
 *   2. Nao pode existir outra reserva na mesma quadra + dia_semana + horario
 *      com status diferente de CANCELADO.
 *
 * Violacao -> HTTP 409 (conflito).
 * Requisitos relacionados: RF-003, RF-004
 *
 * @returns {object} a quadra, ja validada, para uso pela camada de servicos.
 */
function validarDisponibilidade(quadraId, diaSemana, horario) {
  const quadra = quadraRepository.buscarPorId(quadraId);

  if (!quadra) {
    throw new AppError('Quadra nao encontrada.', 404, 'RNE-002');
  }

  if (!quadra.horarios_disponiveis.includes(horario)) {
    throw new AppError(
      `O horario ${horario} nao esta entre os horarios disponiveis desta quadra.`,
      409,
      'RNE-002'
    );
  }

  if (reservaRepository.existeConflito(quadraId, diaSemana, horario)) {
    throw new AppError(
      `Ja existe uma reserva para esta quadra em ${diaSemana} as ${horario}.`,
      409,
      'RNE-002'
    );
  }

  return quadra;
}

/**
 * Valida o status informado ao criar/alterar uma reserva.
 * Valores aceitos: SOLICITADO, AGENDADO, CANCELADO, REALIZADO — os mesmos
 * filtros da tela "Minha Agenda".
 * Requisitos relacionados: RF-007
 */
function validarStatus(status) {
  if (!status) return;
  if (!reservaRepository.STATUS_VALIDOS.includes(String(status).toUpperCase())) {
    throw new AppError(
      `Status invalido. Valores aceitos: ${reservaRepository.STATUS_VALIDOS.join(', ')}.`,
      400
    );
  }
}

/**
 * Valida que a reserva existe, pertence ao usuario autenticado e ainda pode
 * ser cancelada. Complementa a RNE-001: estar autenticado nao basta, a reserva
 * precisa ser do proprio usuario.
 * Requisitos relacionados: RF-007
 *
 * @returns {object} a reserva validada.
 */
function validarCancelamento(reservaId, usuarioId) {
  const reserva = reservaRepository.buscarPorId(reservaId);

  if (!reserva) {
    throw new AppError('Reserva nao encontrada.', 404);
  }
  if (reserva.usuario_id !== usuarioId) {
    throw new AppError('Esta reserva nao pertence ao usuario autenticado.', 403);
  }
  if (reserva.status === 'CANCELADO') {
    throw new AppError('Esta reserva ja esta cancelada.', 409);
  }
  if (reserva.status === 'REALIZADO') {
    throw new AppError('Uma reserva ja realizada nao pode ser cancelada.', 409);
  }

  return reserva;
}

module.exports = {
  DIAS_SEMANA,
  validarDadosReserva,
  validarDisponibilidade,
  validarStatus,
  validarCancelamento,
};
