/**
 * Camada de Apresentacao — controller de avaliacoes.
 *
 * Fluxo obrigatorio: controller -> rules -> service -> repository.
 */
const avaliacaoRules = require('../rules/avaliacao.rules');
const avaliacaoService = require('../services/avaliacao.service');

/** POST /api/avaliacoes  (autenticada — RNE-005) */
function criar(req, res, next) {
  try {
    const usuario_id = req.usuario.id;
    const { arena_id, nota } = req.body || {};

    // 1. Regra de negocio: RNE-005
    avaliacaoRules.validarAvaliacao({ usuario_id, arena_id, nota });

    // 2. Servico: insere e recalcula a media da arena
    const { avaliacao, arena } = avaliacaoService.criar({
      usuario_id,
      arena_id,
      nota,
    });

    return res.status(201).json({ avaliacao, arena });
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { criar };
