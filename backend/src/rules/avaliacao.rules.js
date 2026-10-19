/**
 * Camada de Regras de Negocio — Avaliacoes.
 */
const AppError = require('../utils/AppError');
const arenaRepository = require('../repositories/arena.repository');
const avaliacaoRepository = require('../repositories/avaliacao.repository');

/**
 * RNE-005 — A avaliacao de uma arena so pode ser realizada por usuarios
 * autenticados.
 *
 * A exigencia de autenticacao e garantida pelo `auth.middleware.js` aplicado na
 * rota `POST /api/avaliacoes` (sem token valido -> HTTP 401). Aqui completa-se
 * a regra validando o conteudo da avaliacao: a arena precisa existir e a nota
 * precisa ser um dos quatro valores permitidos (MUITO_BOM, BOM, MEDIO, RUIM),
 * os mesmos do dropdown da tela de avaliacao.
 * Requisitos relacionados: RF-003
 *
 * @returns {object} a arena validada, para uso pela camada de servicos.
 */
function validarAvaliacao({ usuario_id, arena_id, nota }) {
  if (!usuario_id) {
    throw new AppError(
      'Apenas usuarios autenticados podem avaliar uma arena.',
      401,
      'RNE-005'
    );
  }

  if (!arena_id || String(arena_id).trim() === '') {
    throw new AppError('O campo "arena_id" e obrigatorio.', 400, 'RNE-005');
  }

  const arena = arenaRepository.buscarPorId(arena_id);
  if (!arena) {
    throw new AppError('Arena nao encontrada.', 404, 'RNE-005');
  }

  if (!nota || String(nota).trim() === '') {
    throw new AppError('O campo "nota" e obrigatorio.', 400, 'RNE-005');
  }

  if (!avaliacaoRepository.NOTAS_VALIDAS.includes(String(nota).toUpperCase())) {
    throw new AppError(
      `Nota invalida. Valores aceitos: ${avaliacaoRepository.NOTAS_VALIDAS.join(', ')}.`,
      400,
      'RNE-005'
    );
  }

  return arena;
}

module.exports = { validarAvaliacao };
