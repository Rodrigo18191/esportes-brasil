/**
 * Camada de Apresentacao — controller de arenas (RF-003).
 */
const arenaService = require('../services/arena.service');

/** GET /api/arenas?regiao=&cidade= */
function listar(req, res, next) {
  try {
    const { regiao, cidade } = req.query;
    const arenas = arenaService.listar({ regiao, cidade });
    return res.status(200).json(arenas);
  } catch (erro) {
    return next(erro);
  }
}

/** GET /api/arenas/:id */
function detalhar(req, res, next) {
  try {
    const arena = arenaService.buscarPorId(req.params.id);
    return res.status(200).json(arena);
  } catch (erro) {
    return next(erro);
  }
}

/** GET /api/arenas/:id/quadras */
function listarQuadras(req, res, next) {
  try {
    const quadras = arenaService.listarQuadras(req.params.id);
    return res.status(200).json(quadras);
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { listar, detalhar, listarQuadras };
