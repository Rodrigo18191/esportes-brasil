/**
 * Erro de aplicacao.
 *
 * Carrega o status HTTP e, opcionalmente, o ID da regra de negocio violada
 * (RNE-XXX). O `error.middleware.js` transforma este objeto no corpo de erro
 * padronizado da API:
 *
 *   { "erro": true, "mensagem": "Turma lotada.", "regra": "RNE-004" }
 */
class AppError extends Error {
  /**
   * @param {string} mensagem  Mensagem legivel para o cliente.
   * @param {number} status    Status HTTP (default 400).
   * @param {string|null} regra ID da regra de negocio violada, quando houver.
   */
  constructor(mensagem, status = 400, regra = null) {
    super(mensagem);
    this.name = 'AppError';
    this.status = status;
    this.regra = regra;
    Error.captureStackTrace(this, AppError);
  }
}

module.exports = AppError;
