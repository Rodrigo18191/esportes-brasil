/**
 * Camada de Servicos — Turmas (RF-005, RF-006).
 *
 * Orquestra a criacao de turmas (incluindo o criador como primeiro
 * participante) e a entrada de novos participantes.
 */
const { uuid, agoraISO } = require('../utils/uuid');
const turmaRepository = require('../repositories/turma.repository');
const notificacaoService = require('./notificacao.service');

/**
 * RF-005 — Cria uma turma.
 * O criador entra automaticamente como primeiro participante, entao
 * `vagas_preenchidas` comeca em 1.
 */
function criar({ criador_id, nome, esporte, horario, vagas_total }) {
  const turma = turmaRepository.criar({
    id: uuid(),
    criador_id,
    nome,
    esporte,
    horario,
    vagas_total,
    vagas_preenchidas: 1,
    criado_em: agoraISO(),
  });

  turmaRepository.adicionarParticipante(turma.id, criador_id);

  notificacaoService.notificar(
    criador_id,
    `Turma "${turma.nome}" criada com ${turma.vagas_total} vagas.`
  );

  return { ...turma, participantes: turmaRepository.listarParticipantes(turma.id) };
}

/** RF-006 — Lista as turmas visiveis, com filtro opcional por esporte. */
function listarVisiveis({ esporte } = {}) {
  return turmaRepository.listarVisiveis({ esporte });
}

/** RF-005 — Turmas que o usuario criou ou das quais participa. */
function listarDoUsuario(usuarioId) {
  return turmaRepository.listarPorUsuario(usuarioId);
}

/**
 * RF-006 — Adiciona o usuario a uma turma ja validada pela camada de regras
 * (RNE-004) e atualiza a contagem de vagas preenchidas.
 */
function participar(turma, usuarioId) {
  turmaRepository.adicionarParticipante(turma.id, usuarioId);

  const atualizada = turmaRepository.atualizarVagasPreenchidas(
    turma.id,
    turma.vagas_preenchidas + 1
  );

  notificacaoService.notificar(
    usuarioId,
    `Voce entrou na turma "${turma.nome}".`
  );
  notificacaoService.notificar(
    turma.criador_id,
    `Um novo participante entrou na turma "${turma.nome}".`
  );

  return {
    ...atualizada,
    participantes: turmaRepository.listarParticipantes(turma.id),
  };
}

module.exports = { criar, listarVisiveis, listarDoUsuario, participar };
