/**
 * Camada de Apresentacao — controller de notificacoes.
 *
 * Expoe as notificacoes registradas pelo `notificacao.service` para a tela de
 * Notificacoes do frontend.
 */
const notificacaoService = require('../services/notificacao.service');

/** GET /api/notificacoes  (autenticada) */
function listarMinhas(req, res, next) {
  try {
    const notificacoes = notificacaoService.listarPorUsuario(req.usuario.id);
    return res.status(200).json(notificacoes);
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { listarMinhas };
