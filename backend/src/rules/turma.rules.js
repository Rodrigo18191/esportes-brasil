/**
 * Camada de Regras de Negocio — Turmas.
 *
 * Concentra as regras RNE-003, RNE-004 e RNE-006.
 */
const AppError = require('../utils/AppError');
const turmaRepository = require('../repositories/turma.repository');

/**
 * RNE-003 — Uma turma esportiva deve ter no minimo dois participantes para ser
 * criada.
 *
 * Valida que `vagas_total` e um numero inteiro maior ou igual a 2.
 * Violacao -> HTTP 400.
 * Requisitos relacionados: RF-005
 */
function validarMinimoParticipantes(vagasTotal) {
  const total = Number(vagasTotal);

  if (!Number.isInteger(total)) {
    throw new AppError(
      'O campo "vagas_total" deve ser um numero inteiro.',
      400,
      'RNE-003'
    );
  }
  if (total < 2) {
    throw new AppError(
      'Uma turma deve ter no minimo dois participantes.',
      400,
      'RNE-003'
    );
  }

  return total;
}

/**
 * RNE-006 — Uma turma so fica visivel para outros usuarios apos ser criada com
 * pelo menos um esporte e um horario definido.
 *
 * Na criacao, `esporte` e `horario` sao obrigatorios e nao podem ser string
 * vazia. Na listagem publica (`GET /api/turmas`) as turmas sem esses campos sao
 * filtradas fora — ver `turma.repository.listarVisiveis`.
 * Violacao -> HTTP 400.
 * Requisitos relacionados: RF-005, RF-006
 */
function validarVisibilidade({ esporte, horario }) {
  if (!esporte || String(esporte).trim() === '') {
    throw new AppError(
      'A turma precisa ter um esporte definido para ficar visivel.',
      400,
      'RNE-006'
    );
  }
  if (!horario || String(horario).trim() === '') {
    throw new AppError(
      'A turma precisa ter um horario definido para ficar visivel.',
      400,
      'RNE-006'
    );
  }
}

/**
 * Validacao de formato dos demais dados da turma.
 * Nao e uma RNE: garante apenas que o nome foi informado.
 * Requisitos relacionados: RF-005
 */
function validarDadosTurma({ nome }) {
  if (!nome || String(nome).trim() === '') {
    throw new AppError('O campo "nome" e obrigatorio.', 400);
  }
}

/**
 * RNE-004 — Um usuario so pode entrar em uma turma se houver vagas disponiveis.
 *
 * Valida que `vagas_preenchidas < vagas_total` e que o usuario ainda nao e
 * participante da turma.
 * Turma lotada -> HTTP 409.
 * Requisitos relacionados: RF-006
 *
 * @returns {object} a turma validada, para uso pela camada de servicos.
 */
function validarVagasDisponiveis(turmaId, usuarioId) {
  const turma = turmaRepository.buscarPorId(turmaId);

  if (!turma) {
    throw new AppError('Turma nao encontrada.', 404, 'RNE-004');
  }

  if (turmaRepository.ehParticipante(turmaId, usuarioId)) {
    throw new AppError('Usuario ja participa desta turma.', 409, 'RNE-004');
  }

  if (turma.vagas_preenchidas >= turma.vagas_total) {
    throw new AppError('Turma lotada.', 409, 'RNE-004');
  }

  return turma;
}

module.exports = {
  validarMinimoParticipantes,
  validarVisibilidade,
  validarDadosTurma,
  validarVagasDisponiveis,
};
