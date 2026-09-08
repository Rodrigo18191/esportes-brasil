/**
 * Camada de Persistencia — tabela `arena`.
 */
const db = require('../database/connection');

/** Insere uma arena. */
function criar({ id, nome, regiao, cidade, avaliacao_media = 0 }) {
  db.prepare(
    `INSERT INTO arena (id, nome, regiao, cidade, avaliacao_media)
     VALUES (@id, @nome, @regiao, @cidade, @avaliacao_media)`
  ).run({ id, nome, regiao, cidade, avaliacao_media });

  return buscarPorId(id);
}

/** Busca uma arena pelo id. */
function buscarPorId(id) {
  return db.prepare(`SELECT * FROM arena WHERE id = ?`).get(id);
}

/**
 * Lista arenas, com filtros opcionais por regiao e cidade
 * (comparacao sem diferenciar maiusculas/minusculas).
 */
function listar({ regiao, cidade } = {}) {
  let sql = `SELECT * FROM arena WHERE 1 = 1`;
  const params = {};

  if (regiao) {
    sql += ` AND UPPER(regiao) = UPPER(@regiao)`;
    params.regiao = regiao;
  }
  if (cidade) {
    sql += ` AND UPPER(cidade) = UPPER(@cidade)`;
    params.cidade = cidade;
  }

  sql += ` ORDER BY nome`;
  return db.prepare(sql).all(params);
}

/** Atualiza a media de avaliacoes da arena. */
function atualizarMedia(id, media) {
  db.prepare(`UPDATE arena SET avaliacao_media = ? WHERE id = ?`).run(media, id);
  return buscarPorId(id);
}

/** Remove todas as arenas (usado pelo seed idempotente). */
function limpar() {
  db.prepare(`DELETE FROM arena`).run();
}

module.exports = { criar, buscarPorId, listar, atualizarMedia, limpar };
