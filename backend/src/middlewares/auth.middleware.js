/**
 * Camada de Apresentacao — middleware de autenticacao.
 *
 * RNE-001 — Um usuario so pode realizar uma reserva se estiver autenticado.
 *
 * Valida o JWT enviado no header `Authorization: Bearer <token>`. Sem token, ou
 * com token invalido/expirado, a requisicao e barrada com HTTP 401 antes de
 * chegar ao controller. Aplicado nas rotas de reserva, turma e avaliacao —
 * esta ultima cobre tambem a RNE-005.
 * Requisitos relacionados: RF-002, RF-004
 */
const jwt = require('jsonwebtoken');

const env = require('../config/env');
const AppError = require('../utils/AppError');
const usuarioRepository = require('../repositories/usuario.repository');

/**
 * Fabrica do middleware de autenticacao.
 *
 * @param {string} regra ID da regra reportada no corpo do erro 401. As rotas de
 *   reserva e turma usam RNE-001; a rota de avaliacao usa RNE-005, que exige a
 *   mesma autenticacao — assim a resposta aponta para a regra correta.
 */
function criarAutenticador(regra) {
  return function autenticar(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return next(
        new AppError(
          'Token de autenticacao nao informado. Faca login para continuar.',
          401,
          regra
        )
      );
    }

    const token = header.slice('Bearer '.length).trim();

    try {
      const payload = jwt.verify(token, env.JWT_SECRET);
      const usuario = usuarioRepository.buscarPorId(payload.sub);

      if (!usuario) {
        return next(new AppError('Usuario do token nao existe mais.', 401, regra));
      }

      // O restante da aplicacao le o usuario autenticado daqui — nunca do corpo
      // da requisicao.
      req.usuario = usuario;
      return next();
    } catch (erro) {
      return next(
        new AppError('Token de autenticacao invalido ou expirado.', 401, regra)
      );
    }
  };
}

/** RNE-001 — usado nas rotas de reserva e turma. */
const autenticar = criarAutenticador('RNE-001');

/** RNE-005 — usado na rota de avaliacao. */
const autenticarAvaliacao = criarAutenticador('RNE-005');

module.exports = { autenticar, autenticarAvaliacao, criarAutenticador };
