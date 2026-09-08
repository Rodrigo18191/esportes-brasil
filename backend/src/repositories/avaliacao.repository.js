/**
 * Camada de Persistencia — tabela `avaliacao`.
 */
const db = require('../database/connection');

const NOTAS_VALIDAS = ['MUITO_BOM', 'BOM', 'MEDIO', 'RUIM'];

/** Peso numerico de cada nota, usado no calculo de `avaliacao_media`. */
const PESO_NOTA = {
  MUITO_BOM: 4,
  BOM: 3,
  MEDIO: 2,
  RUIM: 1,
};

/** Insere uma avaliacao. */
function criar({ id, usuario_id, arena_id, nota, criado_em }) {
  db.prepare(
    `INSERT INTO avaliacao (id, usuario_id, arena_id, nota, criado_em)
     VALUES (@id, @usuario_id, @arena_id, @nota, @criado_em)`
  ).run({ id, usuario_id, arena_id, nota, criado_em });

  return buscarPorId(id);
}

/** Busca uma avaliacao pelo id. */
function buscarPorId(id) {
  return db.prepare(`SELECT * FROM avaliacao WHERE id = ?`).get(id);
}

/** Lista as avaliacoes de uma arena. */
function listarPorArena(arenaId) {
  return db
    .prepare(
      `SELECT * FROM avaliacao WHERE arena_id = ? ORDER BY criado_em DESC`
    )
    .all(arenaId);
}

/**
 * Calcula a media ponderada das notas de uma arena
 * (MUITO_BOM=4, BOM=3, MEDIO=2, RUIM=1). Retorna 0 quando nao ha avaliacoes.
 */
function calcularMediaPorArena(arenaId) {
  const linha = db
    .prepare(
      `SELECT AVG(
                CASE nota
                  WHEN 'MUITO_BOM' THEN 4
                  WHEN 'BOM'       THEN 3
                  WHEN 'MEDIO'     THEN 2
                  WHEN 'RUIM'      THEN 1
                  ELSE 0
                END
              ) AS media
         FROM avaliacao
        WHERE arena_id = ?`
    )
    .get(arenaId);

  return linha && linha.media !== null ? Number(linha.media) : 0;
}

/** Remove todas as avaliacoes (usado pelo seed idempotente). */
function limpar() {
  db.prepare(`DELETE FROM avaliacao`).run();
}

module.exports = {
  NOTAS_VALIDAS,
  PESO_NOTA,
  criar,
  buscarPorId,
  listarPorArena,
  calcularMediaPorArena,
  limpar,
};
