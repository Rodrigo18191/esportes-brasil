/**
 * Camada de Apresentacao — controller de reservas (RF-004, RF-007).
 *
 * Fluxo obrigatorio: controller -> rules -> service -> repository.
 */
const reservaRules = require('../rules/reserva.rules');
const reservaService = require('../services/reserva.service');

/** POST /api/reservas  (autenticada — RNE-001) */
function criar(req, res, next) {
  try {
    // RNE-001: o usuario vem do token, nunca do corpo da requisicao.
    const usuario_id = req.usuario.id;
    const { quadra_id, horario, status } = req.body || {};
    const dia_semana = req.body && req.body.dia_semana
      ? String(req.body.dia_semana).toUpperCase()
      : undefined;

    // 1. Regras de negocio
    reservaRules.validarDadosReserva({ quadra_id, dia_semana, horario });
    reservaRules.validarStatus(status);
    reservaRules.validarDisponibilidade(quadra_id, dia_semana, horario); // RNE-002

    // 2. Servico
    const reserva = reservaService.criar({
      usuario_id,
      quadra_id,
      dia_semana,
      horario,
      status: status ? String(status).toUpperCase() : 'AGENDADO',
    });

    return res.status(201).json(reserva);
  } catch (erro) {
    return next(erro);
  }
}

/** GET /api/reservas/minhas?status=  (autenticada) */
function listarMinhas(req, res, next) {
  try {
    const { status } = req.query;
    reservaRules.validarStatus(status);

    const reservas = reservaService.listarDoUsuario(req.usuario.id, { status });
    return res.status(200).json(reservas);
  } catch (erro) {
    return next(erro);
  }
}

/** PATCH /api/reservas/:id/cancelar  (autenticada) */
function cancelar(req, res, next) {
  try {
    const reserva = reservaRules.validarCancelamento(
      req.params.id,
      req.usuario.id
    );

    const atualizada = reservaService.cancelar(reserva);
    return res.status(200).json(atualizada);
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { criar, listarMinhas, cancelar };
