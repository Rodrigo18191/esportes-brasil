/**
 * Camada de Persistencia — tabela `usuario`.
 * Unico lugar do sistema com SQL sobre esta tabela.
 */
const db = require('../database/connection');

/** Insere um novo usuario. */
function criar({ id, nome, email, celular, senha_hash, criado_em }) {
  db.prepare(
    `INSERT INTO usuario (id, nome, email, celular, senha_hash, criado_em)
     VALUES (@id, @nome, @email, @celular, @senha_hash, @criado_em)`
  ).run({ id, nome, email, celular, senha_hash, criado_em });

  return buscarPorId(id);
}

/** Busca um usuario pelo id (sem expor o hash da senha). */
function buscarPorId(id) {
  return db
    .prepare(
      `SELECT id, nome, email, celular, criado_em FROM usuario WHERE id = ?`
    )
    .get(id);
}

/** Busca um usuario pelo e-mail, incluindo `senha_hash` (uso no login). */
function buscarPorEmail(email) {
  return db.prepare(`SELECT * FROM usuario WHERE email = ?`).get(email);
}

/** Indica se ja existe usuario cadastrado com o e-mail informado. */
function existeEmail(email) {
  const linha = db
    .prepare(`SELECT COUNT(*) AS total FROM usuario WHERE email = ?`)
    .get(email);
  return linha.total > 0;
}

/** Lista todos os usuarios (sem senha). */
function listar() {
  return db
    .prepare(
      `SELECT id, nome, email, celular, criado_em FROM usuario ORDER BY nome`
    )
    .all();
}

/** Remove todos os usuarios (usado pelo seed idempotente). */
function limpar() {
  db.prepare(`DELETE FROM usuario`).run();
}

module.exports = {
  criar,
  buscarPorId,
  buscarPorEmail,
  existeEmail,
  listar,
  limpar,
};
