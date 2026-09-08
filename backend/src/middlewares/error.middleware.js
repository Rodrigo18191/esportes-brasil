/**
 * Camada de Apresentacao — tratamento centralizado de erros.
 *
 * Produz o corpo de erro padronizado da API:
 *
 *   { "erro": true, "mensagem": "Turma lotada.", "regra": "RNE-004" }
 *
 * O campo `regra` aparece somente quando o erro nasce de uma violacao de regra
 * de negocio, deixando a rastreabilidade RNE visivel na resposta HTTP.
 */
const AppError = require('../utils/AppError');

/** Rota inexistente -> 404 no mesmo formato de erro. */
function naoEncontrado(req, res, next) {
  next(new AppError(`Rota nao encontrada: ${req.method} ${req.originalUrl}`, 404));
}

/* eslint-disable no-unused-vars */
function tratarErros(erro, req, res, next) {
  if (erro instanceof AppError) {
    const corpo = { erro: true, mensagem: erro.mensagem || erro.message };
    if (erro.regra) corpo.regra = erro.regra;
    return res.status(erro.status).json(corpo);
  }

  // Corpo JSON malformado enviado pelo cliente.
  if (erro.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ erro: true, mensagem: 'Corpo da requisicao nao e um JSON valido.' });
  }

  // Violacao de restricao do SQLite (UNIQUE, FK, PK composta...).
  if (erro.code && String(erro.code).startsWith('SQLITE_CONSTRAINT')) {
    return res.status(409).json({
      erro: true,
      mensagem: 'Operacao viola uma restricao de integridade do banco de dados.',
    });
  }

  console.error('[erro-interno]', erro);
  return res
    .status(500)
    .json({ erro: true, mensagem: 'Erro interno no servidor.' });
}

module.exports = { naoEncontrado, tratarErros };
