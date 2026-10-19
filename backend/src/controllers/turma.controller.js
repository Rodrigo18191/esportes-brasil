/**
 * Camada de Apresentacao — controller de turmas (RF-005, RF-006).
 *
 * Fluxo obrigatorio: controller -> rules -> service -> repository.
 */
const turmaRules = require('../rules/turma.rules');
const turmaService = require('../services/turma.service');

/** POST /api/turmas  (autenticada — RNE-001) */
function criar(req, res, next) {
  try {
    const criador_id = req.usuario.id;
    const { nome, esporte, horario, vagas_total } = req.body || {};

    // 1. Regras de negocio
    turmaRules.validarDadosTurma({ nome });
    turmaRules.validarVisibilidade({ esporte, horario }); // RNE-006
    const total = turmaRules.validarMinimoParticipantes(vagas_total); // RNE-003

    // 2. Servico
    const turma = turmaService.criar({
      criador_id,
      nome: String(nome).trim(),
      esporte: String(esporte).trim(),
      horario: String(horario).trim(),
      vagas_total: total,
    });

    return res.status(201).json(turma);
  } catch (erro) {
    return next(erro);
  }
}

/** GET /api/turmas?esporte=  (publica) */
function listar(req, res, next) {
  try {
    // RNE-006: `listarVisiveis` filtra fora turmas sem esporte ou horario.
    const turmas = turmaService.listarVisiveis({ esporte: req.query.esporte });
    return res.status(200).json(turmas);
  } catch (erro) {
    return next(erro);
  }
}

/** GET /api/turmas/minhas  (autenticada) */
function listarMinhas(req, res, next) {
  try {
    const turmas = turmaService.listarDoUsuario(req.usuario.id);
    return res.status(200).json(turmas);
  } catch (erro) {
    return next(erro);
  }
}

/** GET /api/turmas/:id  (autenticada) — turma com participantes */
function detalhar(req, res, next) {
  try {
    const turma = turmaService.detalhar(req.params.id);
    return res.status(200).json(turma);
  } catch (erro) {
    return next(erro);
  }
}

/** POST /api/turmas/:id/participar  (autenticada) */
function participar(req, res, next) {
  try {
    const usuario_id = req.usuario.id;

    // 1. Regra de negocio: RNE-004 (ha vaga? o usuario ja participa?)
    const turma = turmaRules.validarVagasDisponiveis(req.params.id, usuario_id);

    // 2. Servico
    const atualizada = turmaService.participar(turma, usuario_id);

    return res.status(200).json(atualizada);
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { criar, listar, listarMinhas, detalhar, participar };
